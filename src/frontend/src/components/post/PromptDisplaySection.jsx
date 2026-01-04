import React, { useState } from "react";
import { Sparkles, Copy, Wand2, ChevronRight } from "lucide-react";
import UsePromptModal from "../common/UsePromptModal";
import { toast } from "../../hooks/use-toast";

/**
 * PromptDisplaySection - An elegant, interactive prompt display
 * Features hover effects, copy functionality, and click-to-use
 */
export default function PromptDisplaySection({
  prompt,
  toolType = "text-to-image",
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopyPrompt = (e) => {
    e.stopPropagation(); // Prevent triggering the parent click
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsePrompt = () => {
    setShowModal(true);
  };

  return (
    <>
      <div
        className="mt-4 relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleUsePrompt}
      >
        {/* Gradient border effect on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`}
          style={{ padding: "2px" }}
        />

        {/* Main content container */}
        <div className="relative bg-gradient-to-br from-gray-50 to-purple-50/30 border-2 border-gray-200 rounded-2xl p-4 group-hover:border-transparent transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                AI Prompt
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Copy button */}
              <button
                onClick={handleCopyPrompt}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  copied
                    ? "bg-green-100 text-green-600"
                    : "bg-white/80 hover:bg-white text-gray-600 hover:text-purple-600"
                }`}
                title="Copy prompt"
                aria-label="Copy prompt to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Use prompt indicator */}
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white/80 rounded-lg group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
                <Wand2 className="w-3.5 h-3.5 text-purple-600 group-hover:text-white transition-colors duration-300" />
                <span className="text-xs font-semibold text-purple-600 group-hover:text-white transition-colors duration-300">
                  Use
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-600 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
              </div>
            </div>
          </div>

          {/* Prompt text */}
          <div className="relative">
            <p className="text-sm text-gray-700 leading-relaxed font-mono break-words">
              {prompt}
            </p>

            {/* Hover overlay hint */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-800">
                  Click to use this prompt
                </span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* Shine effect on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none`}
          style={{
            transform: isHovered ? "translateX(100%)" : "translateX(-100%)",
          }}
        />
      </div>

      {/* Confirmation Modal */}
      <UsePromptModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        prompt={prompt}
        toolType={toolType}
      />
    </>
  );
}
