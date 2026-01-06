import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Paperclip,
  X,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Download,
  Share2,
  Users,
  Upload,
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import ShareToGroupModal from "../components/common/ShareToGroupModal";
import CreatePostWidget from "../components/post/CreatePostWidget";
import { communicationApi } from "../api/communicationApi";
import { usePosts } from "../hooks/usePosts";
import { formatAIError } from "../utils/formatAIError";
import { getUserId } from "../api/aiApi";

// Use same base URL as other AI features for consistency
const AI_BACKEND_URL =
  import.meta.env.VITE_AI_BACKEND_URL ||
  (import.meta.env.VITE_AI_API_URL || "http://localhost:9999") + "/api/v1";

const AIChat = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { currentUser, createPost } = usePosts();
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // State
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessages, setPendingMessages] = useState(new Set());
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Image attachment
  const [attachedImageUrl, setAttachedImageUrl] = useState(null);
  const [attachedImagePreview, setAttachedImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Reply to message
  const [replyToMessageId, setReplyToMessageId] = useState(null);
  const [replyToImageUrl, setReplyToImageUrl] = useState(null);

  // Share to group
  const [showShareToGroup, setShowShareToGroup] = useState(false);
  const [shareMediaUrl, setShareMediaUrl] = useState(null);

  // Share to feed
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState(null);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState(null);

  // Polling interval ref
  const pollingRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Listen for dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      const darkModeStorage = localStorage.getItem("darkMode") === "true";
      const bodyHasDark = document.body.classList.contains("dark");
      setIsDarkMode(darkModeStorage || bodyHasDark);
    };

    checkDarkMode();
    window.addEventListener("storage", checkDarkMode);
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("storage", checkDarkMode);
      observer.disconnect();
    };
  }, []);

  // Create session on mount
  useEffect(() => {
    createSession();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Start polling when we have pending messages
  useEffect(() => {
    if (pendingMessages.size > 0 && sessionId) {
      startPolling();
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pendingMessages.size, sessionId]);

  // Create session
  const createSession = async () => {
    try {
      const res = await fetch(`${AI_BACKEND_URL}/chat/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: getUserId() }),
      });
      const data = await res.json();
      const newSessionId =
        data.result?.session_id || data.data?.session_id || data.session_id;

      if (newSessionId) {
        setSessionId(newSessionId);
        setMessages([
          {
            id: "welcome",
            role: "bot",
            content: `Hello! 👋 I'm your AI Assistant, ready to help you create amazing visuals.\n\n✨ **What I can do:**\n\n🎨 Create images from text\n🔍 Upscale & enhance quality\n🧹 Remove backgrounds\n🎭 Reimagine in different styles\n☀️ Adjust lighting & atmosphere\n📐 Expand image boundaries\n🖌️ Transfer artistic styles\n\nJust describe what you want, or attach an image to start editing!`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setError("Unable to create session. Please try again.");
      }
    } catch (err) {
      console.error("Create session error:", err);
      setError(`Connection error: ${err.message}`);
    }
  };

  // Start polling for updates
  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      if (!sessionId || pendingMessages.size === 0) return;

      try {
        const res = await fetch(`${AI_BACKEND_URL}/chat/sessions/${sessionId}`);
        const data = await res.json();

        if (data.result?.messages) {
          data.result.messages.forEach((msg) => {
            if (pendingMessages.has(msg.message_id)) {
              updateMessageFromAPI(msg);

              if (msg.status === "COMPLETED" || msg.status === "FAILED") {
                setPendingMessages((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(msg.message_id);
                  return newSet;
                });
                setIsLoading(false);
              }
            }
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);
  };

  // Update message from API response
  const updateMessageFromAPI = (apiMsg) => {
    const imageUrl = apiMsg.image_url || apiMsg.uploaded_urls?.[0];
    const intent = apiMsg.metadata?.intent;
    const extractedParams = apiMsg.metadata?.extracted_params;

    // Format content based on status
    let content = apiMsg.content || "Done!";
    if (apiMsg.status === "FAILED") {
      // Use formatAIError to show friendly message instead of raw technical error
      content = formatAIError(apiMsg.content || apiMsg.error);
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === apiMsg.message_id
          ? {
              ...m,
              content,
              imageUrl,
              status: apiMsg.status,
              intent,
              extractedParams,
            }
          : m
      )
    );
  };

  // Send message
  const handleSendMessage = async () => {
    if (!sessionId) {
      setError("No session yet. Creating new one...");
      await createSession();
      return;
    }

    const prompt = inputValue.trim();
    if (!prompt) return;

    setInputValue("");
    setIsLoading(true);
    setError(null);

    // Add user message to UI
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: prompt,
        imageUrl: attachedImageUrl,
        timestamp: new Date(),
      },
    ]);

    // Build request
    const requestBody = {
      user_id: getUserId(),
      prompt,
    };

    if (replyToMessageId) {
      requestBody.selected_messages = [replyToMessageId];
      cancelReply();
    }

    if (attachedImageUrl) {
      requestBody.image_url = attachedImageUrl;
      setAttachedImageUrl(null);
    }

    try {
      const res = await fetch(
        `${AI_BACKEND_URL}/chat/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await res.json();
      const messageId = data.result?.message_id || data.data?.message_id;

      if (messageId) {
        // Add pending bot message
        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            role: "bot",
            content: "⏳ Processing...",
            status: "PENDING",
            timestamp: new Date(),
          },
        ]);
        setPendingMessages((prev) => new Set(prev).add(messageId));
      } else {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "bot",
            content: "❌ Unable to send message. Please try again.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("Send message error:", err);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "bot",
          content: `❌ Error: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Handle image file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to get URL
    setIsUploading(true);
    try {
      const result = await communicationApi.uploadChatImage(file);
      const imageUrl =
        result?.result?.image ||
        result?.result?.url ||
        result?.url ||
        result?.image;

      if (imageUrl) {
        setAttachedImageUrl(imageUrl);
      } else {
        setError("Unable to upload image. Please try again.");
        setAttachedImagePreview(null);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Upload error: ${err.message}`);
      setAttachedImagePreview(null);
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const removeAttachedImage = () => {
    setAttachedImageUrl(null);
    setAttachedImagePreview(null);
  };

  // Reply to message
  const handleReplyToImage = (messageId, imageUrl) => {
    setReplyToMessageId(messageId);
    setReplyToImageUrl(imageUrl);
    messageInputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyToMessageId(null);
    setReplyToImageUrl(null);
  };

  // Share handlers
  const handleShareToGroup = (imageUrl) => {
    setShareMediaUrl(imageUrl);
    setShowShareToGroup(true);
  };

  // Share to feed
  const handleShareToFeed = (imageUrl) => {
    setShareImageUrl(imageUrl);
    setShowShareModal(true);
  };

  // Download image
  const handleDownload = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ai-generated-${Date.now()}.jpg`;
    link.click();
  };

  // Reset chat
  const handleResetChat = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setMessages([]);
    setSessionId(null);
    setPendingMessages(new Set());
    setError(null);
    createSession();
  };

  // Key press handler
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header
        className={`${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        } border-b -mx-6 px-6 py-4`}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/ai-tools")}
            className={`flex items-center gap-2 ${
              isDarkMode
                ? "text-slate-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            } transition-colors group`}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium text-sm">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${
                isDarkMode ? "bg-slate-700" : "bg-gray-900"
              } rounded-xl flex items-center justify-center shadow-sm group/icon transition-transform duration-200 hover:scale-105`}
            >
              <MessageCircle className="w-5 h-5 text-white group-hover/icon:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h1
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                AI Chat Assistant
              </h1>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                Intelligent conversation
              </p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isDarkMode
                ? "text-slate-400 hover:text-white hover:bg-slate-700"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            } text-sm transition-all duration-200 group/reset`}
            title="Start new conversation"
          >
            <RotateCcw className="w-4 h-4 group-hover/reset:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline font-medium">New Chat</span>
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div
        className={`${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-100"
        } border rounded-2xl shadow-sm overflow-hidden`}
      >
        {/* Messages Area */}
        <div
          className={`h-[650px] overflow-y-auto p-6 space-y-5 ${
            isDarkMode ? "bg-slate-900/30" : "bg-gray-50/30"
          }`}
        >
          {error && (
            <div
              className={`${
                isDarkMode
                  ? "bg-red-900/30 border-red-700 text-red-300"
                  : "bg-red-50 border-red-200 text-red-700"
              } border px-4 py-3 rounded-xl text-sm animate-fade-in flex items-start gap-3`}
            >
              <span className="text-lg">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 ${
                  msg.role === "user"
                    ? isDarkMode
                      ? "bg-slate-700 text-white shadow-sm"
                      : "bg-gray-900 text-white shadow-sm"
                    : isDarkMode
                    ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50"
                    : "bg-white text-gray-800 shadow-sm border border-gray-200"
                } ${
                  msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                } transition-all duration-200 hover:shadow-md`}
              >
                {/* Message content */}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </div>

                {/* Intent & Params */}
                {msg.intent && (
                  <div
                    className={`text-xs mt-3 px-3 py-1.5 rounded-lg inline-block ${
                      isDarkMode
                        ? "bg-slate-700/50 text-slate-300"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    🎯 {msg.intent}
                  </div>
                )}

                {/* Image */}
                {msg.imageUrl && (
                  <div className="mt-4 space-y-3">
                    <div className="relative group/image">
                      <img
                        src={msg.imageUrl}
                        alt="AI Generated"
                        className={`rounded-xl max-w-full max-h-[300px] object-contain cursor-pointer transition-all duration-300 ${
                          isDarkMode
                            ? "border-2 border-slate-700"
                            : "border-2 border-gray-200"
                        } group-hover/image:scale-[1.02] group-hover/image:shadow-2xl`}
                        onClick={() => setLightboxImage(msg.imageUrl)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors duration-300 rounded-xl pointer-events-none" />
                    </div>
                    {msg.role === "bot" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleDownload(msg.imageUrl)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                            isDarkMode
                              ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                        <button
                          onClick={() =>
                            handleReplyToImage(msg.id, msg.imageUrl)
                          }
                          className="flex items-center gap-1.5 text-xs font-medium bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleShareToFeed(msg.imageUrl)}
                          className="flex items-center gap-1.5 text-xs font-medium bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Post
                        </button>
                        <button
                          onClick={() => handleShareToGroup(msg.imageUrl)}
                          className="flex items-center gap-1.5 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Users className="w-3.5 h-3.5" /> Share
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Status badge */}
                {msg.status && msg.role === "bot" && (
                  <div className="mt-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        msg.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : msg.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-700"
                          : msg.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-xs mt-2 ${
                    msg.role === "user"
                      ? isDarkMode
                        ? "text-slate-300"
                        : "text-gray-200"
                      : isDarkMode
                      ? "text-slate-500"
                      : "text-gray-400"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && pendingMessages.size > 0 && (
            <div className="flex justify-start animate-fade-in">
              <div
                className={`${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700/50"
                    : "bg-white border-gray-200"
                } rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm border`}
              >
                <div className="flex gap-1.5 items-center">
                  <span
                    className={`w-2 h-2 ${
                      isDarkMode ? "bg-slate-400" : "bg-gray-500"
                    } rounded-full animate-bounce`}
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className={`w-2 h-2 ${
                      isDarkMode ? "bg-slate-400" : "bg-gray-500"
                    } rounded-full animate-bounce`}
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className={`w-2 h-2 ${
                      isDarkMode ? "bg-slate-400" : "bg-gray-500"
                    } rounded-full animate-bounce`}
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className={`p-5 ${
            isDarkMode
              ? "border-t border-slate-700 bg-slate-800/30"
              : "border-t border-gray-200 bg-white"
          }`}
        >
          {/* Reply Preview */}
          {replyToMessageId && replyToImageUrl && (
            <div
              className={`flex items-center gap-3 mb-4 p-3 rounded-xl border transition-all duration-200 ${
                isDarkMode
                  ? "bg-slate-700/50 border-slate-600"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <img
                src={replyToImageUrl}
                alt=""
                className={`w-14 h-14 rounded-lg object-cover border ${
                  isDarkMode ? "border-slate-500" : "border-gray-300"
                }`}
              />
              <div className="flex-1">
                <div
                  className={`text-xs font-semibold mb-1 ${
                    isDarkMode ? "text-slate-200" : "text-gray-700"
                  }`}
                >
                  ↩️ Editing this image
                </div>
                <div
                  className={`text-xs ${
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  Describe your changes below
                </div>
              </div>
              <button
                onClick={cancelReply}
                className={`${
                  isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                } p-1.5 rounded-lg transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Attached Image Preview */}
          {(attachedImagePreview || attachedImageUrl) && (
            <div
              className={`flex items-center gap-3 mb-4 p-3 rounded-xl border transition-all duration-200 ${
                isDarkMode
                  ? "bg-slate-700/50 border-slate-600"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <img
                src={attachedImagePreview || attachedImageUrl}
                alt=""
                className={`w-14 h-14 rounded-lg object-cover border ${
                  isDarkMode ? "border-slate-500" : "border-gray-300"
                }`}
              />
              <div className="flex-1 overflow-hidden">
                <div
                  className={`text-xs font-semibold flex items-center gap-2 ${
                    isDarkMode ? "text-slate-200" : "text-gray-700"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading
                      image...
                    </>
                  ) : (
                    <>📎 Image attached</>
                  )}
                </div>
                {attachedImageUrl && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Ready to send
                  </div>
                )}
              </div>
              <button
                onClick={removeAttachedImage}
                disabled={isUploading}
                className={`${
                  isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                } p-1.5 rounded-lg transition-colors disabled:opacity-50`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-3">
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-110 ${
                isDarkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              title="Upload image"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </button>
            <input
              ref={messageInputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                isDarkMode
                  ? "bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-slate-500 focus:bg-slate-600/50"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:bg-gray-50"
              } focus:outline-none`}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 ${
                isDarkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              } disabled:hover:bg-slate-700 group/send`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 group-hover/send:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-pointer animate-fade-in backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white bg-white/10 hover:bg-white/20 rounded-xl text-2xl transition-all duration-200 hover:scale-110 hover:rotate-90"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-6xl max-h-[90vh] animate-scale-in">
            <img
              src={lightboxImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Share to Group Modal */}
      <ShareToGroupModal
        isOpen={showShareToGroup}
        onClose={() => setShowShareToGroup(false)}
        mediaUrl={shareMediaUrl}
        isVideo={false}
        prompt="AI Generated Image"
      />

      {/* Share to Feed Modal */}
      {showShareModal && (
        <CreatePostWidget
          currentUser={currentUser}
          onCreatePost={createPost}
          autoOpen={true}
          hideComposer={true}
          initialImageUrl={shareImageUrl}
          initialPrompt="🤖 Created with AI Chat"
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default AIChat;
