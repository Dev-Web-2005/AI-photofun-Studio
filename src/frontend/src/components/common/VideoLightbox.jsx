import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Download, Play, Pause } from "lucide-react";

/**
 * VideoLightbox - A reusable component for viewing videos in fullscreen
 * Uses React Portal to render outside parent DOM hierarchy
 */
const VideoLightbox = ({
    isOpen,
    onClose,
    videoUrl,
    title = "Video",
    showDownload = true,
}) => {
    const videoRef = React.useRef(null);
    const [isPlaying, setIsPlaying] = React.useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen && videoRef.current) {
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [isOpen]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === " ") {
                e.preventDefault();
                togglePlay();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const togglePlay = useCallback(() => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, []);

    const handleDownload = useCallback(() => {
        if (!videoUrl) return;
        const link = document.createElement("a");
        link.href = videoUrl;
        link.download = `video-${Date.now()}.mp4`;
        link.click();
    }, [videoUrl]);

    if (!isOpen) return null;

    const lightboxContent = (
        <div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                {showDownload && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownload();
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors ml-2 cursor-pointer"
                        title="Download"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors ml-2 cursor-pointer"
                    title="Close (ESC)"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Video Container */}
            <div
                className="flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "90vw",
                    height: "90vh",
                }}
            >
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="object-contain rounded-lg"
                    style={{
                        maxWidth: "90vw",
                        maxHeight: "90vh",
                    }}
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center">
                Space to play/pause • ESC to close
            </div>
        </div>
    );

    // Use Portal to render lightbox outside parent DOM hierarchy
    return createPortal(lightboxContent, document.body);
};

export default VideoLightbox;
