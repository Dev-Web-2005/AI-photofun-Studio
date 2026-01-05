import axios from "axios";
import tokenManager from "./tokenManager";

const COMMENT_API_BASE = import.meta.env.VITE_COMMENT_API_URL || "";
const COMMENTS_BASE_URL = `${COMMENT_API_BASE}/comments`;

const commentAxios = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

commentAxios.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const commentApi = {
  getCommentsByPost: (postId) => {
    if (!postId) {
      return Promise.reject(new Error("postId is required"));
    }

    return commentAxios.get(`${COMMENTS_BASE_URL}/post/${postId}`);
  },

  createComment: (payload) => commentAxios.post(COMMENTS_BASE_URL, payload),
};

export default commentApi;
