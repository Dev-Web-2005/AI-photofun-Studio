import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Video, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { galleryApi } from "../api/galleryApi";
import { videoGalleryApi } from "../api/videoGalleryApi";
import ImageLightbox from "../components/common/ImageLightbox";
import VideoLightbox from "../components/common/VideoLightbox";

const Gallery = () => {
  const [activeTab, setActiveTab] = useState("images"); // "images" or "videos"
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const { user } = useAuthContext();

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

  // Fetch images
  const fetchImages = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const response = showDeleted
        ? await galleryApi.getDeletedImages(user.id)
        : await galleryApi.getImages(user.id);

      const imageData = response?.data?.result || [];
      setImages(imageData);
    } catch (err) {
      console.error("Failed to fetch images:", err);
      setError("Failed to load images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos
  const fetchVideos = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const response = showDeleted
        ? await videoGalleryApi.getDeletedVideos(user.id)
        : await videoGalleryApi.getVideos(user.id);

      const videoData = response?.data?.result || [];
      setVideos(videoData);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      setError("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab, user or showDeleted changes
  useEffect(() => {
    if (activeTab === "images") {
      fetchImages();
    } else {
      fetchVideos();
    }
  }, [user?.id, showDeleted, activeTab]);

  // Handle image delete/restore
  const handleImageDelete = async (imageId) => {
    try {
      if (showDeleted) {
        await galleryApi.permanentDeleteImage(imageId);
      } else {
        await galleryApi.deleteImage(imageId);
      }
      fetchImages();
    } catch (err) {
      console.error("Failed to delete image:", err);
      setError("Failed to delete image. Please try again.");
    }
  };

  const handleImageRestore = async (imageId) => {
    try {
      await galleryApi.restoreImage(imageId);
      fetchImages();
    } catch (err) {
      console.error("Failed to restore image:", err);
      setError("Failed to restore image. Please try again.");
    }
  };

  // Handle video delete/restore
  const handleVideoDelete = async (videoId) => {
    try {
      if (showDeleted) {
        await videoGalleryApi.permanentDeleteVideo(videoId);
      } else {
        await videoGalleryApi.deleteVideo(videoId);
      }
      fetchVideos();
    } catch (err) {
      console.error("Failed to delete video:", err);
      setError("Failed to delete video. Please try again.");
    }
  };

  const handleVideoRestore = async (videoId) => {
    try {
      await videoGalleryApi.restoreVideo(videoId);
      fetchVideos();
    } catch (err) {
      console.error("Failed to restore video:", err);
      setError("Failed to restore video. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header
        className={`${isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
          } border-b -mx-6 px-6 py-5 mb-2`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isDarkMode ? "bg-purple-500/20" : "bg-purple-50"
                }`}
            >
              {activeTab === "images" ? (
                <ImageIcon
                  className={`w-6 h-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                />
              ) : (
                <Video
                  className={`w-6 h-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                />
              )}
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                My Gallery
              </h1>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}
              >
                View and manage your AI-generated {activeTab === "images" ? "images" : "videos"}
              </p>
            </div>
          </div>

          {/* Toggle Deleted */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${showDeleted
                ? isDarkMode
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-purple-100 text-purple-600"
                : isDarkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {showDeleted ? "Show Active" : "Show Deleted"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 gap-2">
          <button
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "images"
                ? isDarkMode
                  ? "bg-purple-500 text-white"
                  : "bg-purple-600 text-white"
                : isDarkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <ImageIcon className="w-4 h-4" />
            Images
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "videos"
                ? isDarkMode
                  ? "bg-purple-500 text-white"
                  : "bg-purple-600 text-white"
                : isDarkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <Video className="w-4 h-4" />
            Videos
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div
          className={`p-4 rounded-lg ${isDarkMode
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-red-50 border border-red-200 text-red-600"
            }`}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2
            className={`w-8 h-8 animate-spin ${isDarkMode ? "text-purple-400" : "text-purple-600"
              }`}
          />
        </div>
      )}

      {/* Images Tab Content */}
      {activeTab === "images" && !loading && (
        <>
          {/* Empty State */}
          {images.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className={`p-4 rounded-full mb-4 ${isDarkMode ? "bg-slate-700" : "bg-gray-100"
                  }`}
              >
                <ImageIcon
                  className={`w-12 h-12 ${isDarkMode ? "text-slate-500" : "text-gray-400"
                    }`}
                />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
              >
                {showDeleted ? "No deleted images" : "No images yet"}
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}
              >
                {showDeleted
                  ? "You haven't deleted any images"
                  : "Start creating images with AI tools"}
              </p>
            </div>
          )}

          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.image_id}
                  className={`group relative rounded-lg overflow-hidden ${isDarkMode
                      ? "bg-slate-800 border border-slate-700"
                      : "bg-white border border-gray-200"
                    } hover:shadow-lg transition-shadow`}
                >
                  {/* Image */}
                  <div
                    className="aspect-square cursor-pointer overflow-hidden"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.refined_prompt || "Generated image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Image Info */}
                  <div className="p-3">
                    <p
                      className={`text-sm line-clamp-2 mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                    >
                      {image.refined_prompt || "No prompt available"}
                    </p>
                    <p
                      className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                    >
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {showDeleted ? (
                      <button
                        onClick={() => handleImageRestore(image.image_id)}
                        className={`p-2 rounded-lg backdrop-blur-sm ${isDarkMode
                            ? "bg-green-500/80 hover:bg-green-500"
                            : "bg-green-500 hover:bg-green-600"
                          } text-white transition-colors`}
                        title="Restore"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleImageDelete(image.image_id)}
                      className={`p-2 rounded-lg backdrop-blur-sm ${isDarkMode
                          ? "bg-red-500/80 hover:bg-red-500"
                          : "bg-red-500 hover:bg-red-600"
                        } text-white transition-colors`}
                      title={showDeleted ? "Delete permanently" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Videos Tab Content */}
      {activeTab === "videos" && !loading && (
        <>
          {/* Empty State */}
          {videos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className={`p-4 rounded-full mb-4 ${isDarkMode ? "bg-slate-700" : "bg-gray-100"
                  }`}
              >
                <Video
                  className={`w-12 h-12 ${isDarkMode ? "text-slate-500" : "text-gray-400"
                    }`}
                />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
              >
                {showDeleted ? "No deleted videos" : "No videos yet"}
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}
              >
                {showDeleted
                  ? "You haven't deleted any videos"
                  : "Start creating videos with AI tools"}
              </p>
            </div>
          )}

          {/* Video Grid */}
          {videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <div
                  key={video.video_id}
                  className={`group relative rounded-lg overflow-hidden ${isDarkMode
                      ? "bg-slate-800 border border-slate-700"
                      : "bg-white border border-gray-200"
                    } hover:shadow-lg transition-shadow`}
                >
                  {/* Video Thumbnail */}
                  <div
                    className="aspect-video cursor-pointer overflow-hidden relative bg-slate-900"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      muted
                      preload="metadata"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Video className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-3">
                    <p
                      className={`text-sm line-clamp-2 mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                    >
                      {video.prompt || "No prompt available"}
                    </p>
                    <p
                      className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                    >
                      {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {showDeleted ? (
                      <button
                        onClick={() => handleVideoRestore(video.video_id)}
                        className={`p-2 rounded-lg backdrop-blur-sm ${isDarkMode
                            ? "bg-green-500/80 hover:bg-green-500"
                            : "bg-green-500 hover:bg-green-600"
                          } text-white transition-colors`}
                        title="Restore"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleVideoDelete(video.video_id)}
                      className={`p-2 rounded-lg backdrop-blur-sm ${isDarkMode
                          ? "bg-red-500/80 hover:bg-red-500"
                          : "bg-red-500 hover:bg-red-600"
                        } text-white transition-colors`}
                      title={showDeleted ? "Delete permanently" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.image_url}
        alt={selectedImage?.refined_prompt || "Generated image"}
      />

      {/* Video Lightbox */}
      <VideoLightbox
        isOpen={selectedVideo !== null}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.video_url}
        title={selectedVideo?.prompt || "Generated video"}
      />
    </div>
  );
};

export default Gallery;
