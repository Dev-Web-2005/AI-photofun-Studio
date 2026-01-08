import axios from "axios";
import tokenManager from "./tokenManager";

const COGNITIVE_API_BASE = import.meta.env.VITE_COGNITIVE_API_URL || "";
const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || "";

const cognitiveAxios = axios.create({
  timeout: 60000,
  withCredentials: true,
});

cognitiveAxios.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["x-api-key"] = "lethanhcong";
  return config;
});

export const cognitiveApi = {
  detectSafetyContent: async (message) => {
    try {
      const baseUrl = COGNITIVE_API_BASE || `${API_GATEWAY}/api/v1/cognitive`;
      const response = await cognitiveAxios.post(
        `${baseUrl}/detect-safety-content`,
        { message },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data?.code === 1000) {
        return {
          success: true,
          isSafe: response.data.data?.isSafe ?? true,
        };
      }
      return { success: false, isSafe: true };
    } catch (error) {
      console.error("Detect safety content error:", error);
      return { success: false, isSafe: true };
    }
  },

  speechToText: async (audioFile) => {
    try {
      const baseUrl = COGNITIVE_API_BASE || `${API_GATEWAY}/api/v1/cognitive`;
      const formData = new FormData();
      formData.append("audio", audioFile);

      const response = await cognitiveAxios.post(
        `${baseUrl}/speech-to-text`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.code === 1000) {
        return {
          success: true,
          text: response.data.data?.text || "",
        };
      }
      return {
        success: false,
        text: "",
        error: response.data?.message || "Failed to convert speech to text",
      };
    } catch (error) {
      console.error("Speech to text error:", error);
      return {
        success: false,
        text: "",
        error: error.message || "Failed to convert speech to text",
      };
    }
  },
};

export default cognitiveApi;
