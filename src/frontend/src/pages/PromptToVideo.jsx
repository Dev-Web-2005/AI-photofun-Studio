import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Download, Film, Play, Share2, Video, Mic, MicOff, Loader2 } from "lucide-react";
import {
  suggestPrompts,
  recordPromptChoice,
  generateVideoFromPrompt,
  pollVideoTaskStatus,
} from "../api/aiApi";
import { cognitiveApi } from "../api/cognitiveApi";
import { toast } from "../hooks/use-toast";

// Models for Prompt to Video (Text to Video)
const PROMPT_TO_VIDEO_MODELS = [
  {
    value: "wan2.6-t2v",
    label: "wan2.6-t2v (Default)",
    description: "High quality",
  },
  {
    value: "wan2.5-t2v-preview",
    label: "wan2.5-t2v-preview",
    description: "New Preview",
  },
  {
    value: "wan2.2-t2v-plus",
    label: "wan2.2-t2v-plus",
    description: "Plus version",
  },
  {
    value: "wan2.1-t2v-plus",
    label: "wan2.1-t2v-plus",
    description: "Older Plus version",
  },
  {
    value: "wan2.1-t2v-turbo",
    label: "wan2.1-t2v-turbo",
    description: "Turbo - fastest",
  },
];

const PromptToVideo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pollIntervalRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);
  const promptInputRef = useRef(null);

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("wan2.6-t2v");
  const [loading, setLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState("");

  // Prompt suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isConvertingSpeech, setIsConvertingSpeech] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [showSpeechLangModal, setShowSpeechLangModal] = useState(false);

  // Check for prompt passed via navigation state
  useEffect(() => {
    if (location.state?.prompt) {
      setPrompt(location.state.prompt);
      // Show a nice notification
      toast.success("Prompt loaded! Ready to generate your video.", {
        description: "You can edit the prompt or generate directly.",
      });
      // Clear the state to prevent re-applying on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch suggestions
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

  const handlePromptChange = (event) => {
    const value = event.target.value;
    setPrompt(value);

    // Debounce suggestion fetch
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handlePromptFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      fetchSuggestions(prompt);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setPrompt(suggestion.text);
    setShowSuggestions(false);
    setSuggestions([]);
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

  // Poll for task status
  const pollStatus = useCallback(async (id) => {
    const result = await pollVideoTaskStatus(
      id,
      "prompt-to-video",
      (status) => setTaskStatus(status || "Processing..."),
      1 // Only poll once, will be called again by interval
    );

    if (result.success) {
      setVideoUrl(result.videoUrl);
      setLoading(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    } else if (result.error && !result.error.includes("Timeout")) {
      toast.error(result.error);
      setLoading(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  }, []);

  // Start video generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.warning("Please enter a video description.");
      return;
    }

    const safetyResult = await cognitiveApi.detectSafetyContent(prompt.trim());
    if (safetyResult.success && !safetyResult.isSafe) {
      toast.error("Your prompt contains inappropriate content. Please use more polite and appropriate language.");
      return;
    }

    setError("");
    setLoading(true);
    setVideoUrl(null);
    setTaskId(null);
    setTaskStatus("Initializing...");
    setShowSuggestions(false);

    // Record prompt choice
    try {
      await recordPromptChoice(prompt.trim());
    } catch (err) {
      console.error("Failed to record prompt choice:", err);
    }

    const result = await generateVideoFromPrompt({
      prompt: prompt.trim(),
      model: model,
    });

    if (result.success && result.taskId) {
      setTaskId(result.taskId);
      setTaskStatus("Creating video...");

      // Start polling
      pollIntervalRef.current = setInterval(() => {
        pollStatus(result.taskId);
      }, 3000);

      // Initial poll
      setTimeout(() => pollStatus(result.taskId), 1000);
    } else {
      toast.error(result.error || "Unable to create video. Please try again.");
      setLoading(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

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
        await handleSpeechToVideo(audioBlob);
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

  const handleSpeechToVideo = async (audioBlob) => {
    setIsConvertingSpeech(true);
    try {
      const audioFile = new File([audioBlob], "speech.webm", { type: "audio/webm" });
      const result = await cognitiveApi.speechToText(audioFile);
      
      if (result.success && result.text) {
        const transcribedText = result.text.trim();
        setPrompt(transcribedText);
        toast.success("Speech converted successfully! Click Create Video to generate your video.");
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

  const handleDownload = async () => {
    if (!videoUrl) return;
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ai-generated-video.mp4";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(videoUrl, "_blank");
    }
  };

  const handleReset = () => {
    setPrompt("");
    setVideoUrl(null);
    setTaskId(null);
    setTaskStatus("");
    setError("");
    setSuggestions([]);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  };

  // Share video to feed
  const handleShare = () => {
    if (!videoUrl) return;
    // Navigate to dashboard with video URL and prompt pre-filled
    navigate("/dashboard", {
      state: {
        shareVideo: {
          videoUrl: videoUrl,
          prompt: prompt,
        },
      },
    });
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
          <Video className="w-5 h-5 text-pink-500" /> Prompt to Video
        </h1>
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isConvertingSpeech}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
          }`}
        >
          {isConvertingSpeech ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
          {isConvertingSpeech ? "Converting..." : isRecording ? "Stop" : "Speech to Video"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input */}
        <section className="space-y-6">
          {/* Prompt */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Video Description</h2>

            <div className="space-y-4">
              <div className="relative" ref={promptInputRef}>
                <label className="block text-sm font-semibold mb-2">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={handlePromptChange}
                  onFocus={handlePromptFocus}
                  placeholder="Describe the video you want to create, e.g.: A cat running on a flower field with blue sky..."
                  className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[150px] text-sm"
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
                        <p className="text-sm text-gray-800">
                          {suggestion.text}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white"
                >
                  {PROMPT_TO_VIDEO_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label} - {m.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!videoUrl && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold text-lg flex items-center justify-center gap-2 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {taskStatus || "Processing..."}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" /> Create Video
                </>
              )}
            </button>
          )}
        </section>

        {/* Right Column - Result */}
        <section className="space-y-6">
          {loading && !videoUrl && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="aspect-video rounded-2xl bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-600 border-t-pink-500 dark:border-t-white rounded-full animate-spin mb-4" />
                <p className="font-semibold text-gray-700 dark:text-gray-200">
                  Creating video...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {taskStatus}
                </p>
                {taskId && (
                  <p className="text-xs text-gray-400 mt-2">
                    Task ID: {taskId}
                  </p>
                )}
              </div>
            </div>
          )}

          {videoUrl && (
            <>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Generated Video</h2>
                <div className="aspect-video rounded-2xl bg-black overflow-hidden">
                  <video
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support video.
                  </video>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:from-pink-700 hover:to-purple-700"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50"
                  >
                    Create New
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold mb-3">Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Model: </span>
                    <span className="font-medium">{model}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Prompt: </span>
                    <span className="font-medium">{prompt}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!loading && !videoUrl && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Video className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="font-semibold text-gray-700 mb-1">
                    No video yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Enter a video description and click "Create Video"
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Speech Language Warning Modal */}
      {showSpeechLangModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowSpeechLangModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="text-center">
                <Mic className="w-12 h-12 mx-auto text-pink-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Speech to Video</h3>
                <p className="text-gray-600 mb-6">
                  Please note: This feature only supports <strong>English</strong> language. 
                  Speak clearly in English to describe the video you want to create.
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
                    className="flex-1 py-2 px-4 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"
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

export default PromptToVideo;
