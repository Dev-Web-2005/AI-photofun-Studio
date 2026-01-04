import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, Image, Video, Wand2 } from "lucide-react";

/**
 * UsePromptModal - A minimalist, elegant modal for confirming prompt reuse
 * Displays prompt preview and navigates to appropriate AI tool
 */
export default function UsePromptModal({ isOpen, onClose, prompt, toolType }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Determine the target route and icon based on tool type
  const getToolInfo = () => {
    switch (toolType) {
      case "text-to-image":
        return {
          route: "/text-to-image",
          icon: Image,
          title: "Text to Image",
          color: "from-blue-500 to-purple-600",
          description: "Generate stunning images from text",
        };
      case "prompt-to-video":
        return {
          route: "/prompt-to-video",
          icon: Video,
          title: "Prompt to Video",
          color: "from-purple-500 to-pink-600",
          description: "Create amazing videos from prompts",
        };
      case "image-to-video":
        return {
          route: "/image-to-video",
          icon: Video,
          title: "Image to Video",
          color: "from-pink-500 to-red-600",
          description: "Animate images into videos",
        };
      default:
        return {
          route: "/ai-tools",
          icon: Wand2,
          title: "AI Tools",
          color: "from-indigo-500 to-purple-600",
          description: "Explore AI creative tools",
        };
    }
  };

  const toolInfo = getToolInfo();
  const IconComponent = toolInfo.icon;

  const handleUsePrompt = () => {
    // Navigate with state containing the prompt
    navigate(toolInfo.route, { state: { prompt } });
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl animate-scaleIn overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${toolInfo.color} p-6 relative overflow-hidden`}>
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Use This Prompt?</h3>
                <p className="text-sm text-white/90 mt-0.5">{toolInfo.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tool destination info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
            <div className={`p-2 bg-gradient-to-r ${toolInfo.color} rounded-lg`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Navigate to</p>
              <p className="text-sm font-semibold text-gray-900">{toolInfo.title}</p>
            </div>
          </div>

          {/* Prompt preview */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Prompt Preview
            </label>
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 max-h-40 overflow-y-auto">
              <div className="absolute top-2 right-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-mono pr-6">
                {prompt}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUsePrompt}
              className={`flex-1 px-4 py-3 rounded-xl bg-gradient-to-r ${toolInfo.color} text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2`}
            >
              <Sparkles className="w-4 h-4" />
              Use Prompt
            </button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className={`h-1 bg-gradient-to-r ${toolInfo.color}`} />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
