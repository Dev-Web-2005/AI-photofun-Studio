import React, { useEffect, useMemo, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  Loader2,
  MoreHorizontal,
  Send,
  Smile,
  Edit2,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { commentApi } from "../../api/commentApi";
import { userApi } from "../../api/userApi";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop";

const buildCurrentUser = (user) => ({
  id: user?.id || user?.userId,
  name: user?.fullName || user?.username || user?.email || "You",
  avatar: user?.avatar || user?.avatarUrl || DEFAULT_AVATAR,
  isPremium: Boolean(
    user?.isPremium ||
      user?.premium ||
      user?.premiumOneMonth ||
      user?.premiumSixMonths
  ),
});

const formatRelativeTime = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

const extractUserInfo = (payload) => ({
  name:
    payload?.fullName ||
    payload?.username ||
    payload?.displayName ||
    payload?.email ||
    "User",
  avatar:
    payload?.avatarUrl ||
    payload?.avatar ||
    payload?.profileImage ||
    DEFAULT_AVATAR,
  isPremium: Boolean(
    payload?.isPremium ||
      payload?.premium ||
      payload?.premiumOneMonth ||
      payload?.premiumSixMonths
  ),
});

const parseApiData = (response) =>
  response?.data?.result?.data ||
  response?.data?.result?.items ||
  response?.data?.result ||
  response?.data?.data ||
  response?.data ||
  [];

// WebSocket URL cho comment service (cổng 8003 local, production dùng VITE_SOCKET_COMMENT_URL + /ws)
const WS_BASE =
  import.meta.env.VITE_SOCKET_COMMENT_URL || "http://localhost:8003";
const SOCKET_URL = WS_BASE.replace(/^http/, "ws") + "/ws";

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const onEmojiClick = (emojiObject) => {
    setNewComment((prev) => prev + emojiObject.emoji);
  };

  const [menuOpenId, setMenuOpenId] = useState(null);
  const socketRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentUser = useMemo(() => buildCurrentUser(user), [user]);

  useEffect(() => {
    let isMounted = true;

    const fetchComments = async () => {
      if (!postId) return;
      console.log("[CommentSection] Fetching comments for post", postId);
      setLoading(true);
      setError("");

      try {
        const response = await commentApi.getCommentsByPost(postId);
        console.log("[CommentSection] Comments API response", response?.data);
        const rawComments = parseApiData(response);
        const commentsArray = Array.isArray(rawComments) ? rawComments : [];
        const uniqueUserIds = Array.from(
          new Set(
            commentsArray
              .map((comment) => comment.userId)
              .filter((userId) => Boolean(userId))
          )
        );

        const userEntries = await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const userResponse = await userApi.getUserById(userId);
              console.log(
                `[CommentSection] User API response for ${userId}`,
                userResponse?.data
              );
              // API returns { result: { ...user } }, so we extract result directly
              const userData = userResponse?.data?.result;
              return [userId, extractUserInfo(userData)];
            } catch (fetchUserError) {
              console.error("Failed to load user info", fetchUserError);
              return [userId, extractUserInfo(null)];
            }
          })
        );

        const userMap = Object.fromEntries(userEntries);

        const normalizedComments = commentsArray.map((comment) => ({
          id: comment?.id || comment?._id || String(Date.now()),
          userId: comment?.userId,
          user: userMap[comment?.userId] || {
            name: comment?.userName || "User",
            avatar: DEFAULT_AVATAR,
            isPremium: false,
          },
          content: comment?.content || "",
          time: formatRelativeTime(comment?.createdAt || comment?.updatedAt),
          likes: comment?.likes ?? 0,
          isLiked: false,
        }));

        if (isMounted) {
          setComments(normalizedComments);
        }
      } catch (fetchError) {
        console.error("Failed to fetch comments", fetchError);
        if (isMounted) {
          setError(
            fetchError?.response?.data?.message ||
              fetchError?.message ||
              "Unable to load comments"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!postId || socketRef.current) return undefined;

    let ws = null;

    try {
      ws = new WebSocket(SOCKET_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        try {
          ws.send(JSON.stringify({ type: "join", room: postId }));
        } catch (err) {
          console.error("Failed to send join message:", err);
        }
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "new_comment": {
              const payload = message.data;
              if (!payload || (payload.postId && payload.postId !== postId))
                return;

              let userInfo = {
                name: payload?.userName || "User",
                avatar: DEFAULT_AVATAR,
                isPremium: false,
              };

              if (payload?.userId) {
                try {
                  const userResponse = await userApi.getUserById(
                    payload.userId
                  );
                  userInfo = extractUserInfo(userResponse?.data?.result);
                } catch (userError) {
                  console.error("Failed to fetch user info", userError);
                }
              }

              const normalized = {
                id: payload?.id || payload?._id || String(Date.now()),
                userId: payload?.userId,
                user: userInfo,
                content: payload?.content || "",
                time: formatRelativeTime(
                  payload?.createdAt || payload?.updatedAt
                ),
                likes: payload?.likes ?? 0,
                isLiked: false,
                isNew: true,
              };

              setComments((prev) => {
                const exists = prev.some(
                  (comment) => String(comment.id) === String(normalized.id)
                );
                if (exists) return prev;
                return [...prev, normalized];
              });

              setTimeout(() => {
                setComments((prev) =>
                  prev.map((c) =>
                    c.id === normalized.id ? { ...c, isNew: false } : c
                  )
                );
              }, 3000);
              break;
            }

            case "update_comment": {
              const payload = message.data;
              setComments((prev) =>
                prev.map((c) =>
                  c.id === payload.id
                    ? {
                        ...c,
                        content: payload.content,
                        time: formatRelativeTime(payload.updatedAt),
                      }
                    : c
                )
              );
              break;
            }

            case "delete_comment": {
              const payload = message.data;
              setComments((prev) => prev.filter((c) => c.id !== payload.id));
              break;
            }

            default:
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("❌ WebSocket closed");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }

    return () => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        try {
          socketRef.current.send(
            JSON.stringify({ type: "leave", room: postId })
          );
        } catch (err) {
          console.error("Failed to send leave message:", err);
        }
        socketRef.current.close();
      }
      socketRef.current = null;
    };
  }, [postId]);

  const handleSend = async () => {
    const content = newComment.trim();
    if (!content || !postId || !currentUser.id) return;

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        postId,
        userId: currentUser.id,
        userName: currentUser.name,
        content,
      };

      const response = await commentApi.createComment(payload);
      const created = parseApiData(response);

      const normalized = {
        id: created?.id || created?._id || String(Date.now()),
        userId: currentUser.id,
        user: currentUser,
        content: created?.content || content,
        time: formatRelativeTime(
          created?.createdAt || new Date().toISOString()
        ),
        likes: created?.likes ?? 0,
        isLiked: false,
      };

      setComments((prev) => {
        const exists = prev.some(
          (comment) => String(comment.id) === String(normalized.id)
        );
        if (exists) return prev;
        return [...prev, normalized];
      });
      setNewComment("");
    } catch (createError) {
      console.error("Failed to create comment", createError);
      setError(
        createError?.response?.data?.message ||
          createError?.message ||
          "Unable to send comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setMenuOpenId(null);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      await commentApi.updateComment(commentId, { content: editContent });
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, content: editContent, time: "Just now" }
            : c
        )
      );
      setEditingCommentId(null);
      setEditContent("");
    } catch (updateError) {
      console.error("Failed to update comment", updateError);
      setError("Unable to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    setError("");

    try {
      await commentApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setMenuOpenId(null);
    } catch (deleteError) {
      console.error("Failed to delete comment", deleteError);
      setError("Unable to delete comment");
    }
  };

  if (!postId) {
    return (
      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        Post not found to load comments.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Comments ({comments.length})
        </h3>
      </div>

      {error && (
        <div className="mx-4 mt-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          Error loading comments: {error}
        </div>
      )}

      <div className="max-h-72 space-y-5 overflow-y-auto px-4 py-4 text-sm">
        {loading && (
          <div className="flex justify-center py-6 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!loading && !comments.length && !error && (
          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No comments yet. Be the first!
          </div>
        )}

        {!loading &&
          !error &&
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex gap-3 rounded-xl p-3 transition-all ${
                comment.isNew
                  ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700"
                  : "bg-gray-50/70 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <img
                src={comment.user.avatar}
                alt={comment.user.name}
                className={`h-10 w-10 rounded-full object-cover shrink-0 ${
                  comment.user.isPremium
                    ? "ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-gray-800"
                    : ""
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {comment.user.name}
                    </span>
                    {comment.user.isPremium && (
                      <span className="rounded-full border border-yellow-200 dark:border-yellow-700 bg-yellow-100 dark:bg-yellow-900/50 px-2 text-[10px] font-semibold text-yellow-700 dark:text-yellow-300">
                        PRO
                      </span>
                    )}
                    {comment.isNew && (
                      <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        NEW
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{comment.time}</span>
                  </div>
                  
                  {/* Three-dot menu inline with header */}
                  {comment.userId === currentUser.id && (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpenId(
                            menuOpenId === comment.id ? null : comment.id
                          )
                        }
                        className="rounded-full p-1.5 text-gray-400 dark:text-gray-500 transition hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                        aria-label="Comment options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpenId === comment.id && (
                        <div className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg">
                          <button
                            type="button"
                            onClick={() => handleEditComment(comment)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingCommentId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                      rows={2}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={isSubmitting}
                        className="rounded-lg bg-blue-600 dark:bg-blue-500 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditContent("");
                        }}
                        className="rounded-lg bg-gray-300 dark:bg-gray-600 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.content}</p>
                )}
              </div>
            </div>
          ))}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div className="relative flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                currentUser.id ? "Write a comment..." : "Login to comment"
              }
              disabled={!currentUser.id || isSubmitting}
              className="w-full rounded-full border border-transparent bg-gray-100 dark:bg-gray-700 py-2.5 pl-4 pr-16 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500"
            />
            <div
              ref={emojiPickerRef}
              className="absolute inset-y-0 right-10 flex items-center"
            >
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  showEmojiPicker
                    ? "bg-blue-100 text-blue-600 scale-110"
                    : "text-gray-400 hover:bg-gray-100 hover:text-blue-500"
                }`}
                aria-label="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-3 z-50 opacity-0 animate-[fadeIn_0.2s_ease-in-out_forwards]">
                  <div className="relative">
                    {/* Elegant shadow backdrop */}
                    <div className="absolute inset-0 bg-linear-to-t from-gray-900/10 to-transparent rounded-2xl blur-xl transform translate-y-2" />

                    {/* Emoji Picker Container */}
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        width={340}
                        height={420}
                        previewConfig={{ showPreview: false }}
                        searchDisabled={false}
                        theme="light"
                        skinTonesDisabled={false}
                        emojiStyle="native"
                      />
                    </div>

                    {/* Elegant arrow pointer */}
                    <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45" />
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!newComment.trim() || !currentUser.id || isSubmitting}
              className="absolute inset-y-0 right-2 flex items-center rounded-full p-1.5 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              aria-label="Send comment"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
