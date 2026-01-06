import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, Download } from "lucide-react";

/**
 * ImageLightbox - A reusable component for viewing images in fullscreen with zoom
 * Can be used in ChatBot, PostCard, and other components
 * Uses React Portal to render outside parent DOM hierarchy
 */
const ImageLightbox = ({
  isOpen,
  onClose,
  imageUrl,
  alt = "Image",
  showDownload = true,
}) => {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = React.useState(false);
  const [startPosition, setStartPosition] = React.useState({ x: 0, y: 0 });
  
  // Track if interaction started from image (to prevent closing viewer when dragging from image to overlay)
  const interactionFromImage = React.useRef(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setHasMoved(false);
      interactionFromImage.current = false;
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
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

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, 0.5);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  }, []);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `image-${Date.now()}.jpg`;
    link.click();
  }, [imageUrl]);

  const handleMouseDown = (e) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setHasMoved(false);
      setStartPosition({ x: e.clientX, y: e.clientY });
      // Store current mouse position minus current image position
      setDragStart({ 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      // Track if user has moved mouse significantly (threshold: 5px)
      const dx = Math.abs(e.clientX - startPosition.x);
      const dy = Math.abs(e.clientY - startPosition.y);
      if (dx > 5 || dy > 5) {
        setHasMoved(true);
      }
      
      // Calculate new position as current mouse position minus drag start offset
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset hasMoved after a short delay to allow onClick to check the current state
    setTimeout(() => {
      setHasMoved(false);
      interactionFromImage.current = false;
    }, 0);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!isOpen) return null;

  const lightboxContent = (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={(e) => {
        // Only close if:
        // 1. No drag movement detected (!hasMoved)
        // 2. Interaction did not start from image (!interactionFromImage.current)
        if (!hasMoved && !interactionFromImage.current) {
          onClose();
        }
      }}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
          title="Zoom out (-)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-white text-sm font-medium min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
          title="Zoom in (+)"
        >
          <ZoomIn className="w-5 h-5" />
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

      {/* Image Container - overflow visible to allow zoom beyond initial bounds */}
      <div
        className="flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          width: "90vw",
          height: "90vh",
          overflow: "visible",
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          onMouseDown={(e) => {
            // Mark that interaction started from image
            interactionFromImage.current = true;
          }}
          onClick={(e) => e.stopPropagation()}
          className="object-contain transition-transform duration-200"
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
          draggable={false}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center">
        Scroll to zoom • Drag to move • ESC to close
      </div>
    </div>
  );

  // Use Portal to render lightbox outside parent DOM hierarchy
  return createPortal(lightboxContent, document.body);
};

export default ImageLightbox;
