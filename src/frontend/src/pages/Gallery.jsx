import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { galleryApi } from "../api/galleryApi";
import ImageLightbox from "../components/common/ImageLightbox";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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

  // Load images on mount and when showDeleted changes
  useEffect(() => {
    fetchImages();
  }, [user?.id, showDeleted]);

  // Handle delete/restore
  const handleDelete = async (imageId) => {
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

  const handleRestore = async (imageId) => {
    try {
      await galleryApi.restoreImage(imageId);
      fetchImages();
    } catch (err) {
      console.error("Failed to restore image:", err);
      setError("Failed to restore image. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header
        className={`${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        } border-b -mx-6 px-6 py-5 mb-2`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isDarkMode ? "bg-purple-500/20" : "bg-purple-50"
              }`}
            >
              <ImageIcon
                className={`w-6 h-6 ${
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                }`}
              />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                My Gallery
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                View and manage your AI-generated images
              </p>
            </div>
          </div>

          {/* Toggle Deleted */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showDeleted
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
      </header>

      {/* Error Message */}
      {error && (
        <div
          className={`p-4 rounded-lg ${
            isDarkMode
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
            className={`w-8 h-8 animate-spin ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className={`p-4 rounded-full mb-4 ${
              isDarkMode ? "bg-slate-700" : "bg-gray-100"
            }`}
          >
            <ImageIcon
              className={`w-12 h-12 ${
                isDarkMode ? "text-slate-500" : "text-gray-400"
              }`}
            />
          </div>
          <h3
            className={`text-lg font-semibold mb-2 ${
              isDarkMode ? "text-slate-300" : "text-gray-700"
            }`}
          >
            {showDeleted ? "No deleted images" : "No images yet"}
          </h3>
          <p
            className={`text-sm ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            {showDeleted
              ? "You haven't deleted any images"
              : "Start creating images with AI tools"}
          </p>
        </div>
      )}

      {/* Image Grid */}
      {!loading && images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.image_id}
              className={`group relative rounded-lg overflow-hidden ${
                isDarkMode
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
                  className={`text-sm line-clamp-2 mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  {image.refined_prompt || "No prompt available"}
                </p>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  {new Date(image.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {showDeleted ? (
                  <button
                    onClick={() => handleRestore(image.image_id)}
                    className={`p-2 rounded-lg backdrop-blur-sm ${
                      isDarkMode
                        ? "bg-green-500/80 hover:bg-green-500"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white transition-colors`}
                    title="Restore"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                ) : null}
                <button
                  onClick={() => handleDelete(image.image_id)}
                  className={`p-2 rounded-lg backdrop-blur-sm ${
                    isDarkMode
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

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.image_url}
        alt={selectedImage?.refined_prompt || "Generated image"}
      />
    </div>
  );
};

export default Gallery;
