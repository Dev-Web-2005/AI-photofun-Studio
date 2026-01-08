import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Image,
  Share2,
  Sparkles,
  Users,
  Mic,
  MicOff,
  Loader2,
} from "lucide-react";
import {
  generateImage,
  pollTaskStatus,
  suggestPrompts,
  recordPromptChoice,
} from "../api/aiApi";
import { cognitiveApi } from "../api/cognitiveApi";
import { usePosts } from "../hooks/usePosts";
import CreatePostWidget from "../components/post/CreatePostWidget";
import ShareToGroupModal from "../components/common/ShareToGroupModal";
import { toast } from "../hooks/use-toast";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const TextToImage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const uploadInputRef = useRef(null);
  const { createPost, currentUser } = usePosts();

  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [model, setModel] = useState("realism");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareToGroup, setShowShareToGroup] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isConvertingSpeech, setIsConvertingSpeech] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [showSpeechLangModal, setShowSpeechLangModal] = useState(false);

  // Prompt suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestionTimeoutRef = useRef(null);
  const promptInputRef = useRef(null);

  const charCount = useMemo(() => prompt.length, [prompt]);

  // Check for prompt passed via navigation state
  useEffect(() => {
    if (location.state?.prompt) {
      setPrompt(location.state.prompt);
      // Show a nice notification
      toast.success("Prompt loaded! Ready to generate your image.", {
        description: "You can edit the prompt or generate directly.",
      });
      // Clear the state to prevent re-applying on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch suggestions when prompt changes (with debounce)
  const fetchSuggestions = useCallback(async (query) => {
    setLoadingSuggestions(true);
    try {
      const result = await suggestPrompts(query || "");
      if (result.success && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Fetch popular suggestions on focus if prompt is empty
  const handlePromptFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      // Fetch popular prompts when focused with empty input
      fetchSuggestions(prompt);
    }
  };

  const handlePromptChange = (event) => {
    const value = event.target.value.slice(0, 1000);
    setPrompt(value);

    // Debounce suggestion fetch
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    setPrompt(suggestion.text);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClearPrompt = () => {
    setPrompt("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        promptInputRef.current &&
        !promptInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilePick = async (files) => {
    if (!files || !files.length) return;
    try {
      const dataUrl = await readFileAsDataUrl(files[0]);
      setUploadedImage(dataUrl);
    } catch (err) {
      toast.error("Unable to read reference image. Please try again.");
    }
  };

  const handleFileChange = (event) => {
    handleFilePick(event.target.files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFilePick(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeUploaded = () => {
    setUploadedImage(null);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.warning("Please enter a description before generating an image.");
      return;
    }

    const safetyResult = await cognitiveApi.detectSafetyContent(prompt.trim());
    if (safetyResult.success && !safetyResult.isSafe) {
      toast.error("Your prompt contains inappropriate content. Please use more polite and appropriate language.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    setTaskStatus("Initializing...");
    setShowSuggestions(false);

    // Record the prompt choice for improving suggestions
    try {
      await recordPromptChoice(prompt.trim());
    } catch (err) {
      console.error("Failed to record prompt choice:", err);
    }

    // Helper to format error message
    const formatError = (error) => {
      const errorStr = (error?.toString() || "").toLowerCase();
      const errorMsg = (error?.message || "").toLowerCase();

      if (
        errorStr.includes("429") ||
        errorStr.includes("rate limit") ||
        errorStr.includes("quota") ||
        errorStr.includes("limit") ||
        errorMsg.includes("429") ||
        errorMsg.includes("rate limit") ||
        errorMsg.includes("exceeded")
      ) {
        return "⚠️ You have reached your daily image generation limit. Please try again tomorrow or upgrade to Premium.";
      }
      if (errorStr.includes("401") || errorStr.includes("unauthorized")) {
        return "⚠️ Authentication error. Please log in again.";
      }
      if (errorStr.includes("500") || errorStr.includes("server")) {
        return "⚠️ The server is busy. Please try again in a few minutes.";
      }
      return error?.message || error || "An error occurred. Please try again.";
    };

    try {
      // Step 1: Submit generation request
      const genResult = await generateImage({
        prompt,
        model,
        aspectRatio,
      });

      if (!genResult.success) {
        toast.error(formatError(genResult.error));
        setLoading(false);
        return;
      }

      setTaskStatus("Generating image...");

      // Step 2: Poll for result
      const pollResult = await pollTaskStatus(
        genResult.taskId,
        "v1/features/image-generation",
        (status, attempt) => {
          setTaskStatus(`${status} (attempt ${attempt})...`);
        }
      );

      if (pollResult.success) {
        setResult({
          imageUrl: pollResult.imageUrl,
          prompt,
          timestamp: new Date().toLocaleString(),
          model,
          aspectRatio,
        });
      } else {
        toast.error(formatError(pollResult.error));
      }
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setLoading(false);
      setTaskStatus("");
    }
  };

  const handleDownload = async () => {
    if (!result?.imageUrl) return;
    try {
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ai-generated-image.jpg";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback to direct link
      const link = document.createElement("a");
      link.href = result.imageUrl;
      link.download = "ai-generated-image.jpg";
      link.target = "_blank";
      link.click();
    }
  };

  const handleShare = () => {
    if (result?.imageUrl) {
      setShowShareModal(true);
    }
  };

  const handleSave = () => {
    alert("Image saved to your library (demo).");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await handleSpeechToImage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Unable to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSpeechToImage = async (audioBlob) => {
    setIsConvertingSpeech(true);
    try {
      const audioFile = new File([audioBlob], "speech.webm", { type: "audio/webm" });
      const result = await cognitiveApi.speechToText(audioFile);
      
      if (result.success && result.text) {
        const transcribedText = result.text.trim();
        setPrompt(transcribedText);
        toast.success("Speech converted successfully! Click Generate to create your image.");
      } else {
        toast.error(result.error || "Failed to convert speech to text. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to convert speech. Please try again.");
    } finally {
      setIsConvertingSpeech(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setShowSpeechLangModal(true);
    }
  };

  const confirmSpeechLanguage = () => {
    setShowSpeechLangModal(false);
    startRecording();
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4 border border-gray-200 rounded-2xl px-4 py-3 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" /> Text to Image
        </h1>
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isConvertingSpeech}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          }`}
        >
          {isConvertingSpeech ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
          {isConvertingSpeech ? "Converting..." : isRecording ? "Stop" : "Speech to Image"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Describe Your Image</h2>
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="prompt"
            >
              Your Prompt
            </label>
            <div className="relative" ref={promptInputRef}>
              <textarea
                id="prompt"
                value={prompt}
                onChange={handlePromptChange}
                onFocus={handlePromptFocus}
                placeholder="Describe what you want to create..."
                className="w-full border border-gray-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[140px] text-sm"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {loadingSuggestions && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Loading suggestions...
                    </div>
                  )}
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <p className="text-sm text-gray-800">{suggestion.text}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>
                Character count: <strong>{charCount}</strong>/1000
              </span>
              <button
                type="button"
                onClick={handleClearPrompt}
                className="font-semibold text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            </div>

            {/* Model and Aspect Ratio Selection */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  htmlFor="model"
                >
                  Model
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white"
                >
                  <option value="realism">Realism</option>
                  <option value="artistic">Artistic</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  htmlFor="aspect-ratio"
                >
                  Aspect Ratio
                </label>
                <select
                  id="aspect-ratio"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">
              Upload Reference Image (Optional)
            </h2>
            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onClick={() => uploadInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Image className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 font-medium">
                Drag & drop your image here
              </p>
              <p className="text-xs text-gray-500 mb-4">or click to browse</p>
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold"
              >
                Select Image
              </button>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {uploadedImage && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Reference preview</p>
                <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
                  <img
                    src={uploadedImage}
                    alt="Reference"
                    className="w-full h-auto object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeUploaded}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          {loading && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="aspect-square rounded-2xl bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin mb-4" />
                <p className="font-semibold text-gray-700 dark:text-gray-200">
                  Generating image...
                </p>
                <p className="text-sm text-gray-500">
                  {taskStatus || "This process may take a few seconds"}
                </p>
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Generated Image</h2>
                <div className="aspect-square rounded-2xl bg-gray-50 overflow-hidden">
                  <img
                    src={result.imageUrl}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white font-semibold"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
                  >
                    <Share2 className="w-4 h-4" /> Share to Feed
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShareToGroup(true)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold"
                  >
                    <Users className="w-4 h-4" /> Send to Group
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold"
                >
                  Save to Library
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold mb-4">Image Details</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <p className="text-xs text-gray-500">Prompt</p>
                    <p className="font-medium">{result.prompt}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="font-medium capitalize">
                        {result.model || "Realism"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Aspect Ratio</p>
                      <p className="font-medium">
                        {result.aspectRatio || "1:1"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Generated at</p>
                      <p className="font-medium">{result.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!loading && !result && (
            <>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-center p-8">
                  <div>
                    <Sparkles className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                    <p className="font-semibold text-gray-700 mb-1">
                      No image yet
                    </p>
                    <p className="text-sm text-gray-500">
                      Start by writing a detailed prompt and tap Generate Image.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="py-4 px-8 rounded-2xl bg-black text-white font-semibold text-lg flex items-center gap-2 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" /> Generate Image
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Share to Post Modal */}
      {showShareModal && (
        <CreatePostWidget
          currentUser={currentUser}
          onCreatePost={createPost}
          autoOpen={true}
          hideComposer={true}
          initialImageUrl={result?.imageUrl}
          initialPrompt={`🎨 Created with AI Text-to-Image\n\nPrompt: ${
            result?.prompt || prompt
          }`}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Share to Group Modal */}
      <ShareToGroupModal
        isOpen={showShareToGroup}
        onClose={() => setShowShareToGroup(false)}
        mediaUrl={result?.imageUrl}
        isVideo={false}
        prompt={result?.prompt || prompt}
      />

      {/* Speech Language Warning Modal */}
      {showSpeechLangModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowSpeechLangModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="text-center">
                <Mic className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Speech to Image</h3>
                <p className="text-gray-600 mb-6">
                  Please note: This feature only supports <strong>English</strong> language. 
                  Speak clearly in English to describe the image you want to create.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSpeechLangModal(false)}
                    className="flex-1 py-2 px-4 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmSpeechLanguage}
                    className="flex-1 py-2 px-4 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700"
                  >
                    Start Recording
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TextToImage;
