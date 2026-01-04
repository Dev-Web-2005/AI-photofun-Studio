import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, Image, Video, Wand2, ArrowRight } from "lucide-react";

/**
 * UsePromptModal - Luxury minimalist modal for prompt confirmation
 * Clean monochromatic design with refined typography
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
          description: "Generate stunning images from text",
        };
      case "prompt-to-video":
        return {
          route: "/prompt-to-video",
          icon: Video,
          title: "Prompt to Video",
          description: "Create amazing videos from prompts",
        };
      case "image-to-video":
        return {
          route: "/image-to-video",
          icon: Video,
          title: "Image to Video",
          description: "Animate images into videos",
        };
      default:
        return {
          route: "/ai-tools",
          icon: Wand2,
          title: "AI Tools",
          description: "Explore AI creative tools",
        };
    }
  };

  const toolInfo = getToolInfo();
  const IconComponent = toolInfo.icon;

  const handleUsePrompt = () => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl animate-scaleIn overflow-hidden border border-gray-200">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <Sparkles className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                  Use This Prompt?
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {toolInfo.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Tool destination */}
          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="p-2 bg-gray-900 rounded-lg">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                Navigate to
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {toolInfo.title}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Prompt preview */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5 block">
              Prompt Preview
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed font-mono tracking-tight">
                {prompt}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUsePrompt}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-black hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Use Prompt
            </button>
          </div>
        </div>
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
