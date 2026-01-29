import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface LightboxMedia {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
}

interface ImageLightboxProps {
  media: LightboxMedia[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ZOOM_LEVELS = [1, 2, 3] as const;
type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export function ImageLightbox({
  media,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMoved, setDragMoved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Touch swipe state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const currentMedia = media[currentIndex];
  const isZoomed = zoomLevel > 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when opening or changing index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      resetZoom();
    }
  }, [isOpen, initialIndex]);

  // Reset image loaded state when switching images
  useEffect(() => {
    if (currentMedia?.type === "image") {
      setImageLoaded(false);
    }
  }, [currentIndex, currentMedia?.url]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
    setDragMoved(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
    resetZoom();
  }, [media.length, resetZoom]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
    resetZoom();
  }, [media.length, resetZoom]);

  const cycleZoom = useCallback(() => {
    setZoomLevel((prev) => {
      const idx = ZOOM_LEVELS.indexOf(prev);
      const next = ZOOM_LEVELS[(idx + 1) % ZOOM_LEVELS.length];
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "+":
        case "=":
          setZoomLevel((prev) => {
            const idx = ZOOM_LEVELS.indexOf(prev);
            const next =
              idx < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[idx + 1] : prev;
            return next;
          });
          break;
        case "-":
          setZoomLevel((prev) => {
            const idx = ZOOM_LEVELS.indexOf(prev);
            if (idx > 0) {
              const next = ZOOM_LEVELS[idx - 1];
              if (next === 1) setPanPosition({ x: 0, y: 0 });
              return next;
            }
            return prev;
          });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose]);

  // Mouse wheel zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (currentMedia?.type !== "image") return;

      if (e.deltaY < 0) {
        // Scroll up = zoom in
        setZoomLevel((prev) => {
          const idx = ZOOM_LEVELS.indexOf(prev);
          return idx < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[idx + 1] : prev;
        });
      } else {
        // Scroll down = zoom out
        setZoomLevel((prev) => {
          const idx = ZOOM_LEVELS.indexOf(prev);
          if (idx > 0) {
            const next = ZOOM_LEVELS[idx - 1];
            if (next === 1) setPanPosition({ x: 0, y: 0 });
            return next;
          }
          return prev;
        });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isOpen, currentMedia?.type]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Click on image: zoom in centered on click, or cycle zoom
  const handleZoomClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (dragMoved) {
      setDragMoved(false);
      return;
    }

    if (zoomLevel === 1) {
      // Zoom in centered on click point
      // The click offset from center needs to be scaled by the target zoom level
      // because at 2x the same image point is at 2x the pixel offset
      const targetZoom = 2;
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;
      setPanPosition({ x: -clickX * targetZoom, y: -clickY * targetZoom });
      setZoomLevel(targetZoom);
    } else {
      resetZoom();
    }
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    e.preventDefault();
    setIsDragging(true);
    setDragMoved(false);
    setDragStart({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isZoomed) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const distance = Math.sqrt(
      Math.pow(newX - panPosition.x, 2) + Math.pow(newY - panPosition.y, 2),
    );
    if (distance > 5) setDragMoved(true);
    setPanPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isZoomed) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isZoomed) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isZoomed || !isSwiping.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx > 0) goToPrevious();
      else goToNext();
    }
  };

  const handleOpenInNewTab = () => {
    if (currentMedia) {
      window.open(currentMedia.url, "_blank");
    }
  };

  if (!mounted) return null;

  const zoomScale = `${zoomLevel * 90}vw`;

  const lightboxContent = (
    <AnimatePresence>
      {isOpen && media.length > 0 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top bar controls */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-20 pointer-events-none">
            {/* Counter */}
            <div className="pointer-events-auto">
              {media.length > 1 && (
                <div className="px-4 py-2 rounded-lg bg-kol-surface-elevated/80 border border-kol-border/50 text-sm text-gray-300 font-mono">
                  {currentIndex + 1} / {media.length}
                </div>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Download / open in new tab */}
              {currentMedia && (
                <button
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 hover:bg-kol-surface-elevated hover:border-kol-border text-gray-400 hover:text-white transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenInNewTab();
                  }}
                  title="Open in new tab"
                >
                  <i className="ri-external-link-line text-lg" />
                </button>
              )}

              {/* Close */}
              <button
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 hover:bg-kol-surface-elevated hover:border-kol-border text-gray-400 hover:text-white transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>
          </div>

          {/* Navigation arrows */}
          {media.length > 1 && (
            <>
              <button
                className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 hover:bg-kol-surface-elevated hover:border-kol-border text-gray-400 hover:text-white transition-all duration-200 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <i className="ri-arrow-left-s-line text-2xl" />
              </button>
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 hover:bg-kol-surface-elevated hover:border-kol-border text-gray-400 hover:text-white transition-all duration-200 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <i className="ri-arrow-right-s-line text-2xl" />
              </button>
            </>
          )}

          {/* Bottom bar: zoom indicator + hint */}
          {currentMedia?.type === "image" && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              {/* Zoom level indicator */}
              <button
                className="px-3 py-1.5 rounded-lg bg-kol-surface-elevated/80 border border-kol-border/50 hover:bg-kol-surface-elevated hover:border-kol-border text-xs text-gray-300 font-mono transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  cycleZoom();
                }}
              >
                {zoomLevel === 1
                  ? "Fit"
                  : `${zoomLevel}x`}
              </button>
              {/* Hint */}
              <div className="px-3 py-1.5 rounded-lg bg-kol-surface-elevated/60 border border-kol-border/30 text-xs text-gray-500">
                {isZoomed
                  ? "Drag to pan, click to reset"
                  : "Click to zoom, scroll wheel to zoom"}
              </div>
            </div>
          )}

          {/* Media content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {currentMedia?.type === "video" ? (
                <div
                  className="relative flex items-center justify-center"
                  style={{ maxWidth: "90vw", maxHeight: "85vh" }}
                >
                  <video
                    key={currentMedia.url}
                    src={currentMedia.url}
                    poster={currentMedia.thumbnailUrl}
                    controls
                    autoPlay
                    className="rounded-lg max-w-full max-h-[85vh]"
                  />
                </div>
              ) : (
                <div
                  className={`relative overflow-hidden rounded-lg ${
                    isZoomed
                      ? isDragging
                        ? "cursor-grabbing"
                        : "cursor-grab"
                      : "cursor-zoom-in"
                  }`}
                  style={{
                    width: isZoomed ? "90vw" : "auto",
                    height: isZoomed ? "85vh" : "auto",
                    maxWidth: "90vw",
                    maxHeight: "85vh",
                  }}
                  onClick={handleZoomClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Loading spinner */}
                  {!imageLoaded && currentMedia && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-8 h-8 border-2 border-kol-border/50 border-t-kol-blue rounded-full animate-spin" />
                    </div>
                  )}
                  <img
                    key={currentMedia?.url}
                    src={currentMedia?.url}
                    alt=""
                    className={`select-none transition-opacity duration-200 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    draggable={false}
                    onLoad={() => setImageLoaded(true)}
                    style={
                      isZoomed
                        ? {
                            width: zoomScale,
                            height: "auto",
                            maxWidth: "none",
                            maxHeight: "none",
                            transform: `translate(calc(-50% + 45vw + ${panPosition.x}px), calc(-50% + 42.5vh + ${panPosition.y}px))`,
                            transition: isDragging
                              ? "none"
                              : "transform 0.15s ease-out",
                          }
                        : {
                            maxWidth: "90vw",
                            maxHeight: "85vh",
                            objectFit: "contain" as const,
                          }
                    }
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Thumbnail strip */}
          {media.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 z-20">
              {media.map((item, idx) => (
                <button
                  key={idx}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    idx === currentIndex
                      ? "border-kol-blue ring-2 ring-kol-blue/30"
                      : "border-kol-border/50 hover:border-kol-border opacity-60 hover:opacity-100"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                    resetZoom();
                  }}
                >
                  <img
                    src={
                      item.type === "video"
                        ? item.thumbnailUrl || item.url
                        : item.url
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <i className="ri-play-fill text-white text-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(lightboxContent, document.body);
}

export default ImageLightbox;
