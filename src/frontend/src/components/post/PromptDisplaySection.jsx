import React, { useState } from "react";
import { Sparkles, Copy, ArrowRight } from "lucide-react";
import UsePromptModal from "../common/UsePromptModal";
import { toast } from "../../hooks/use-toast";

/**
 * PromptDisplaySection - A luxury minimalist prompt display
 * Elegant monochromatic design with subtle gold accents
 */
export default function PromptDisplaySection({
  prompt,
  toolType = "text-to-image",
}) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopyPrompt = (e) => {
    e.stopPropagation();
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
        className="mt-4 group cursor-pointer transition-all duration-300 ease-out"
        onClick={handleUsePrompt}
      >
        {/* Main container with subtle elevation */}
        <div className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
          
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-amber-400/50 group-hover:bg-amber-50/50 transition-all duration-300">
                <Sparkles className="w-3.5 h-3.5 text-gray-600 group-hover:text-amber-600 transition-colors duration-300" />
              </div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                AI Prompt
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Copy button */}
              <button
                onClick={handleCopyPrompt}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  copied
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                }`}
                title="Copy prompt"
                aria-label="Copy prompt to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {/* Use prompt button */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium group-hover:bg-black group-hover:shadow-lg transition-all duration-300">
                <span>Use Prompt</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* Prompt text with refined typography */}
          <div className="relative">
            <p className="text-sm text-gray-700 leading-relaxed font-mono tracking-tight">
              {prompt}
            </p>
          </div>

          {/* Subtle bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
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
