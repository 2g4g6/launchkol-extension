import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "../ui/Tooltip";

export interface MediaItem {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
}

export interface LinkPreview {
  url: string;
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

export interface SocialPostData {
  id: string;
  type: "trade" | "alert" | "mention";
  tweetType?: "post" | "reply" | "repost" | "quote";
  author: {
    name: string;
    handle: string;
    avatar?: string;
    followers?: number;
  };
  content: string;
  timestamp: Date;
  tradeInfo?: {
    action: "buy" | "sell";
    amount: number;
    price: number;
  };
  media?: MediaItem[];
  mediaUrl?: string; // legacy single image support
  tweetUrl?: string;
  replyTo?: {
    author: {
      name: string;
      handle: string;
      avatar?: string;
      followers?: number;
    };
    content: string;
    timestamp?: Date;
    media?: MediaItem[];
    mediaUrl?: string;
    tweetUrl?: string;
    replyTo?: {
      author: {
        name: string;
        handle: string;
        avatar?: string;
        followers?: number;
      };
      content: string;
      timestamp?: Date;
      media?: MediaItem[];
      mediaUrl?: string;
      tweetUrl?: string;
    };
  };
  quotedTweet?: {
    author: {
      name: string;
      handle: string;
      avatar?: string;
      followers?: number;
    };
    content: string;
    timestamp?: Date;
    media?: MediaItem[];
    tweetUrl?: string;
  };
  linkPreview?: LinkPreview;
}

interface SocialPostProps {
  post: SocialPostData;
  index: number;
  onDeploy?: (post: SocialPostData) => void;
}

// Format follower count (e.g., 8500000 -> "8.5M")
function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Lightbox media item with type info
interface LightboxMedia {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
}

export function SocialPost({ post, index, onDeploy }: SocialPostProps) {
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Pan-and-zoom state
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMoved, setDragMoved] = useState(false);

  const isLightboxOpen = lightboxMedia.length > 0;
  const currentMedia = lightboxMedia[lightboxIndex];

  const resetZoomState = () => {
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
    setDragMoved(false);
  };

  const openLightbox = (media: LightboxMedia[], startIndex: number = 0) => {
    setLightboxMedia(media);
    setLightboxIndex(startIndex);
    resetZoomState();
  };

  const closeLightbox = () => {
    setLightboxMedia([]);
    setLightboxIndex(0);
    resetZoomState();
  };

  const goToPrevious = () => {
    setLightboxIndex((prev) =>
      prev > 0 ? prev - 1 : lightboxMedia.length - 1,
    );
    resetZoomState();
  };

  const goToNext = () => {
    setLightboxIndex((prev) =>
      prev < lightboxMedia.length - 1 ? prev + 1 : 0,
    );
    resetZoomState();
  };

  // Zoom click handler - toggles zoom, centers on click position when zooming in
  const handleZoomClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    // If we dragged, don't toggle zoom
    if (dragMoved) {
      setDragMoved(false);
      return;
    }

    if (!isZoomed) {
      // Zoom in - calculate pan position to center on click point
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;
      // Pan in opposite direction of click offset, scaled for zoom
      setPanPosition({ x: -clickX, y: -clickY });
      setIsZoomed(true);
    } else {
      // Zoom out
      resetZoomState();
    }
  };

  // Mouse down - start potential drag
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

  // Mouse move - pan if dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isZoomed) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Check if we've moved enough to count as a drag
    const distance = Math.sqrt(
      Math.pow(newX - panPosition.x, 2) + Math.pow(newY - panPosition.y, 2),
    );
    if (distance > 5) {
      setDragMoved(true);
    }

    setPanPosition({ x: newX, y: newY });
  };

  // Mouse up - stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, lightboxMedia.length]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const formatTimeShort = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Generate avatar initials
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Get type styling
  const getTypeColor = () => {
    switch (post.type) {
      case "alert":
        return "#ff4d4f";
      case "mention":
        return "#007bff";
      default:
        return "#007bff";
    }
  };

  const typeColor = getTypeColor();

  const handleHide = () => {
    console.log("Hide user:", post.author.handle);
  };

  // Extract URLs from text
  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches || [];
  };

  // Get domain from URL
  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  // Get truncated path from URL
  const getTruncatedPath = (url: string, maxLength: number = 30): string => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname + urlObj.search;
      if (path.length > maxLength) {
        return path.slice(0, maxLength) + "...";
      }
      return path || "/";
    } catch {
      return "";
    }
  };

  // Render content with @mentions and URLs highlighted in blue
  const renderContent = (text: string) => {
    // Split by @mentions and URLs
    const parts = text.split(/(@\w+|https?:\/\/[^\s]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        const handle = part.slice(1);
        return (
          <a
            key={i}
            href={`https://x.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-kol-blue hover:underline"
          >
            {part}
          </a>
        );
      }
      if (part.startsWith("http://") || part.startsWith("https://")) {
        // Truncate long URLs for display
        const displayUrl = part.length > 50 ? part.slice(0, 47) + "..." : part;
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-kol-blue hover:underline break-all"
          >
            {displayUrl}
          </a>
        );
      }
      return part;
    });
  };

  // Render rich link preview card (Open Graph style)
  const renderRichLinkPreview = (preview: LinkPreview) => {
    const domain = getDomain(preview.url);

    return (
      <div className="mt-2.5 rounded-lg border border-kol-border/40 bg-kol-surface/30 overflow-hidden hover:border-kol-border/60 transition-colors group/link">
        {/* Preview Image - clickable to open lightbox */}
        {preview.image && (
          <div
            className="relative w-full h-[140px] bg-kol-surface overflow-hidden cursor-pointer"
            onClick={() =>
              openLightbox([{ type: "image", url: preview.image! }])
            }
          >
            <img
              src={preview.image}
              alt=""
              className="w-full h-full object-cover group-hover/link:scale-105 transition-transform duration-300"
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <i className="ri-zoom-in-line text-white text-xl drop-shadow-lg" />
            </div>
          </div>
        )}

        {/* Preview Content - clickable to open link */}
        <a
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 hover:bg-kol-surface/50 transition-colors"
        >
          {/* Site info row */}
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mb-1.5">
            {preview.favicon ? (
              <img
                src={preview.favicon}
                alt=""
                className="w-3.5 h-3.5 rounded-sm"
              />
            ) : (
              <i className="ri-global-line text-xs" />
            )}
            <span>{preview.siteName || domain}</span>
          </div>

          {/* Title */}
          <h4 className="font-body font-medium text-sm text-white leading-tight mb-1 line-clamp-2">
            {preview.title}
          </h4>

          {/* Description */}
          {preview.description && (
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
              {preview.description}
            </p>
          )}
        </a>
      </div>
    );
  };

  // Render simple link preview (fallback when no rich preview data)
  const renderSimpleLinkPreview = (urls: string[]) => {
    if (urls.length === 0) return null;
    const url = urls[0];
    const domain = getDomain(url);
    const path = getTruncatedPath(url, 25);

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2.5 rounded-lg border border-kol-border/40 bg-kol-surface/30 overflow-hidden hover:border-kol-border/60 transition-colors"
      >
        <div className="p-2.5">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
            <i className="ri-global-line text-[10px]" />
            <span>{domain}</span>
          </div>
          <p className="text-gray-300 text-xs truncate">
            {domain}
            {path}
          </p>
        </div>
      </a>
    );
  };

  return (
    <motion.article
      className="group relative mx-3 my-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${typeColor}15 0%, transparent 70%)`,
        }}
      />

      {/* Glass card container */}
      <div className="relative bg-kol-surface/50 backdrop-blur-md border border-kol-border/70 rounded-xl overflow-hidden group-hover:border-kol-border/90 group-hover:bg-kol-surface/60 transition-all duration-300">
        {/* Header Row - Avatar, Author, Actions, Deploy */}
        <div className="flex items-stretch border-b border-kol-border/40 min-h-[60px]">
          {/* Left Section - Avatar & Author Info */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 flex-1 min-w-0">
            {/* Avatar */}
            <button
              onClick={() =>
                window.open(`https://x.com/${post.author.handle}`, "_blank")
              }
              className="flex-shrink-0 hover:opacity-80 transition-opacity duration-150"
            >
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-kol-border/50 hover:ring-kol-blue/50 transition-all"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-kol-border/50"
                  style={{
                    background: `linear-gradient(135deg, ${typeColor}40 0%, ${typeColor}15 100%)`,
                  }}
                >
                  <span className="font-body font-bold text-sm text-white">
                    {getInitials(post.author.name)}
                  </span>
                </div>
              )}
            </button>

            {/* Author Details */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {/* Name Row */}
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <button
                  onClick={() =>
                    window.open(`https://x.com/${post.author.handle}`, "_blank")
                  }
                  className="font-body font-semibold text-sm hover:underline truncate max-w-[120px] text-white"
                >
                  {post.author.name}
                </button>
                <span className="text-xs text-gray-400">
                  {formatTime(post.timestamp)}
                </span>
                {/* Tweet type indicator */}
                {post.tweetType === "reply" && (
                  <div className="flex items-center gap-1">
                    <i className="ri-reply-line text-xs text-kol-green" />
                    <span className="text-xs text-kol-green">Reply</span>
                  </div>
                )}
                {post.tweetType === "repost" && (
                  <div className="flex items-center gap-1">
                    <i className="ri-repeat-2-line text-xs text-kol-green" />
                    <span className="text-xs text-kol-green">Repost</span>
                  </div>
                )}
                {post.tweetType === "quote" && (
                  <div className="flex items-center gap-1">
                    <i
                      className="ri-chat-quote-line text-xs"
                      style={{ color: "#ff9500" }}
                    />
                    <span className="text-xs" style={{ color: "#ff9500" }}>
                      Quote
                    </span>
                  </div>
                )}
              </div>

              {/* Handle & Followers Row */}
              <div className="flex items-center gap-1.5 text-xs">
                <Tooltip content={`@${post.author.handle}`} position="top">
                  <a
                    href={`https://x.com/${post.author.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-kol-blue hover:underline truncate transition-colors max-w-[100px] inline-block"
                  >
                    @{post.author.handle}
                  </a>
                </Tooltip>
                {post.author.followers && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-kol-surface border border-kol-border/50 text-[11px] text-gray-400">
                    <i className="ri-group-line text-[10px]" />
                    {formatFollowers(post.author.followers)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Deploy */}
          {onDeploy && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onDeploy(post);
              }}
              className="flex items-center justify-center gap-2 px-14 py-4 border-l border-kol-border/40 bg-kol-blue/25 hover:bg-kol-blue/40 text-white text-sm font-semibold transition-all duration-300"
              whileTap={{ scale: 0.98 }}
            >
              <span>Launch</span>
              <i className="ri-arrow-right-up-line text-base" />
            </motion.button>
          )}
        </div>

        {/* Content Section */}
        <div className="px-3.5 py-3">
          {/* Tweet Text - only show if there's content */}
          {post.content && (
            <p className="font-body text-sm text-gray-300 leading-relaxed mb-2.5">
              {renderContent(post.content)}
            </p>
          )}

          {/* Link Preview - rich preview if available, otherwise simple fallback */}
          {post.linkPreview
            ? renderRichLinkPreview(post.linkPreview)
            : post.content &&
              renderSimpleLinkPreview(extractUrls(post.content))}

          {/* Media preview - multiple images or video */}
          {post.media && post.media.length > 0 && (
            <div
              className={`mb-2.5 w-full ${post.media.length > 1 ? "grid grid-cols-2 gap-2" : ""}`}
            >
              {post.media.map((item, idx) => {
                const allMedia: LightboxMedia[] = post.media!.map((m) => ({
                  type: m.type,
                  url: m.url,
                  thumbnailUrl: m.thumbnailUrl,
                }));
                return (
                  <div
                    key={idx}
                    className={`relative bg-kol-surface flex items-center justify-center rounded-lg overflow-hidden border border-kol-border/30 cursor-pointer hover:border-kol-blue/50 transition-colors ${
                      post.media!.length === 1 ? "h-[240px]" : "h-[140px]"
                    }`}
                    onClick={() => openLightbox(allMedia, idx)}
                  >
                    {item.type === "video" ? (
                      <div className="relative w-full h-full flex justify-center items-center">
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <i className="ri-play-fill text-2xl text-black ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legacy single image support */}
          {!post.media && post.mediaUrl && (
            <div
              className="relative mb-2.5 rounded-lg overflow-hidden border border-kol-border/30 max-w-[280px] cursor-pointer hover:border-kol-blue/50 transition-colors"
              onClick={() =>
                openLightbox([{ type: "image", url: post.mediaUrl! }])
              }
            >
              <img
                src={post.mediaUrl}
                alt=""
                className="w-full h-auto max-h-[200px] object-contain bg-kol-surface"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Quoted Tweet */}
          {post.quotedTweet && (
            <div className="mb-2.5 rounded-lg border border-kol-border/40 bg-kol-surface/30 overflow-hidden">
              <div className="p-2.5">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {post.quotedTweet.author.avatar ? (
                    <img
                      src={post.quotedTweet.author.avatar}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-kol-surface-elevated" />
                  )}
                  <span className="font-body font-medium text-xs text-white">
                    {post.quotedTweet.author.name}
                  </span>
                  <a
                    href={`https://x.com/${post.quotedTweet.author.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-kol-blue hover:underline text-xs"
                  >
                    @{post.quotedTweet.author.handle}
                  </a>
                  {post.quotedTweet.timestamp && (
                    <>
                      <span className="text-gray-500 text-xs">·</span>
                      <span className="text-gray-400 text-xs">
                        {formatTime(post.quotedTweet.timestamp)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {renderContent(post.quotedTweet.content)}
                </p>
                {post.quotedTweet.media &&
                  post.quotedTweet.media.length > 0 && (
                    <div
                      className="mt-2 rounded-lg overflow-hidden bg-kol-surface border border-kol-border/30 flex justify-center items-center h-[200px] cursor-pointer hover:border-kol-blue/50 transition-colors"
                      onClick={() =>
                        openLightbox(
                          post.quotedTweet!.media!.map((m) => ({
                            type: m.type,
                            url: m.url,
                            thumbnailUrl: m.thumbnailUrl,
                          })),
                        )
                      }
                    >
                      <img
                        src={post.quotedTweet.media[0].url}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Reply Thread Quote */}
          {post.replyTo && (
            <div className="mt-2 pl-3 py-2.5 border-l-[3px] border-kol-green/50 rounded-r-lg bg-kol-surface/30">
              {/* Replying to link */}
              <div className="flex items-center gap-2 mb-2">
                <a
                  href={post.replyTo.tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kol-green hover:text-kol-green/80 transition-colors flex items-center gap-1"
                >
                  <span className="text-xs font-medium">Replying to</span>
                  <i className="ri-external-link-line text-[10px]" />
                </a>
              </div>

              {/* Quoted Author */}
              <div className="flex items-start gap-2.5">
                {post.replyTo.author.avatar ? (
                  <img
                    src={post.replyTo.author.avatar}
                    alt={post.replyTo.author.name}
                    className="w-5 h-5 rounded-full object-cover flex-shrink-0 ring-1 ring-kol-border/30"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-kol-surface-elevated flex-shrink-0 ring-1 ring-kol-border/30" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-body font-medium text-kol-text-secondary text-xs truncate">
                      {post.replyTo.author.name}
                    </span>
                    <a
                      href={`https://x.com/${post.replyTo.author.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-kol-green hover:underline text-xs"
                    >
                      @{post.replyTo.author.handle}
                    </a>
                    {post.replyTo.timestamp && (
                      <>
                        <span className="text-gray-500 text-xs">·</span>
                        <span className="text-gray-400 text-xs">
                          {formatTime(post.replyTo.timestamp)}
                        </span>
                      </>
                    )}
                    {post.replyTo.author.followers && (
                      <>
                        <span className="text-gray-500 text-xs">·</span>
                        <span className="text-gray-400 text-xs flex items-center gap-0.5">
                          <i className="ri-group-line text-[9px]" />
                          {formatFollowers(post.replyTo.author.followers)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {renderContent(post.replyTo.content)}
                  </p>

                  {/* Reply media */}
                  {post.replyTo.mediaUrl && (
                    <div
                      className="mt-2 rounded-lg overflow-hidden border border-kol-border/30 max-w-[200px] cursor-pointer hover:border-kol-green/50 transition-colors"
                      onClick={() =>
                        openLightbox([
                          { type: "image", url: post.replyTo!.mediaUrl! },
                        ])
                      }
                    >
                      <img
                        src={post.replyTo.mediaUrl}
                        alt=""
                        className="w-full h-auto max-h-[120px] object-contain bg-kol-surface"
                      />
                    </div>
                  )}

                  {/* Nested reply - reply within reply */}
                  {post.replyTo.replyTo && (
                    <div className="mt-2.5 pl-3 py-2 border-l-2 border-kol-green/30 rounded-r bg-kol-surface/20">
                      <div className="flex items-start gap-2">
                        {post.replyTo.replyTo.author.avatar ? (
                          <img
                            src={post.replyTo.replyTo.author.avatar}
                            alt={post.replyTo.replyTo.author.name}
                            className="w-4 h-4 rounded-full object-cover flex-shrink-0 ring-1 ring-kol-border/20"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-kol-surface-elevated flex-shrink-0 ring-1 ring-kol-border/20" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="font-body font-medium text-kol-text-secondary text-[11px] truncate">
                              {post.replyTo.replyTo.author.name}
                            </span>
                            <a
                              href={`https://x.com/${post.replyTo.replyTo.author.handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-kol-green hover:underline text-[11px]"
                            >
                              @{post.replyTo.replyTo.author.handle}
                            </a>
                            {post.replyTo.replyTo.timestamp && (
                              <>
                                <span className="text-gray-600 text-[11px]">
                                  ·
                                </span>
                                <span className="text-gray-500 text-[11px]">
                                  {formatTime(post.replyTo.replyTo.timestamp)}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-500 text-[11px] leading-relaxed">
                            {renderContent(post.replyTo.replyTo.content)}
                          </p>

                          {/* Nested reply media */}
                          {post.replyTo.replyTo.media &&
                            post.replyTo.replyTo.media.length > 0 && (
                              <div
                                className="mt-1.5 rounded overflow-hidden border border-kol-border/20 max-w-[160px] cursor-pointer hover:border-kol-green/40 transition-colors"
                                onClick={() =>
                                  openLightbox(
                                    post.replyTo!.replyTo!.media!.map((m) => ({
                                      type: m.type,
                                      url: m.url,
                                      thumbnailUrl: m.thumbnailUrl,
                                    })),
                                  )
                                }
                              >
                                <img
                                  src={post.replyTo.replyTo.media[0].url}
                                  alt=""
                                  className="w-full h-auto max-h-[80px] object-contain bg-kol-surface"
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Toolbar */}
        <div className="flex items-center border-t border-kol-border/40 h-9">
          {/* Left actions - Hide & Notify */}
          <div className="flex items-center h-full">
            <Tooltip content="Hide" position="top">
              <button
                onClick={handleHide}
                className="flex items-center justify-center w-9 h-full text-gray-400 hover:text-white hover:bg-kol-surface/60 transition-all duration-200"
              >
                <i className="ri-close-line text-sm" />
              </button>
            </Tooltip>
            <div className="w-px h-4 bg-kol-border/40" />
          </div>

          {/* Translate section */}
          <div className="flex items-center h-full py-1 ml-1">
            <Tooltip content="Translate this post" position="top">
              <button className="text-[11px] flex items-center gap-1 text-gray-400 hover:text-white hover:bg-kol-surface/60 px-2 h-full transition-all duration-200 rounded-md">
                <i className="ri-translate-2 text-xs" />
                <span className="font-medium">Translate</span>
              </button>
            </Tooltip>
            <Tooltip content="Select language" position="top">
              <button className="flex items-center text-[11px] hover:text-white transition-colors duration-200 text-gray-400 px-1">
                <span className="font-semibold text-[10px] uppercase tracking-wide">
                  en
                </span>
                <i className="ri-arrow-down-s-line text-xs opacity-60" />
              </button>
            </Tooltip>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Time */}
          <div className="flex items-center text-[11px] text-gray-400 px-2.5 h-full font-mono">
            <span>{formatTimeShort(post.timestamp)}</span>
          </div>

          {/* View link */}
          <a
            href={post.tweetUrl || `https://x.com/${post.author.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white text-[11px] flex items-center gap-1 px-2.5 h-full hover:bg-kol-surface/60 transition-all duration-200 font-medium border-l border-kol-border/30"
          >
            <span>View</span>
            <i className="ri-external-link-line text-xs" />
          </a>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
          >
            {/* Close button - styled to match the app */}
            <button
              className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 hover:bg-kol-surface-elevated hover:border-kol-border text-gray-400 hover:text-white transition-all duration-200 z-20"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
            >
              <i className="ri-close-line text-xl" />
            </button>

            {/* Image counter */}
            {lightboxMedia.length > 1 && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-kol-surface-elevated/80 border border-kol-border/50 text-sm text-gray-300 font-mono z-20">
                {lightboxIndex + 1} / {lightboxMedia.length}
              </div>
            )}

            {/* Navigation arrows */}
            {lightboxMedia.length > 1 && (
              <>
                {/* Previous button */}
                <button
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 hover:bg-kol-surface-elevated hover:border-kol-border text-gray-400 hover:text-white transition-all duration-200 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <i className="ri-arrow-left-s-line text-2xl" />
                </button>

                {/* Next button */}
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

            {/* Zoom hint - only for images */}
            {currentMedia?.type === "image" && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-kol-surface-elevated/60 border border-kol-border/30 text-xs text-gray-500 z-20">
                {isZoomed
                  ? "Drag to pan, click to zoom out"
                  : "Click image to zoom"}
              </div>
            )}

            {/* Media container */}
            {currentMedia?.type === "video" ? (
              <motion.div
                className="relative flex items-center justify-center"
                style={{ maxWidth: "90vw", maxHeight: "85vh" }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <video
                  key={currentMedia.url}
                  src={currentMedia.url}
                  poster={currentMedia.thumbnailUrl}
                  controls
                  autoPlay
                  className="rounded-lg max-w-full max-h-[85vh]"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image zoom container - plain div for reliable click handling */}
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
                  <img
                    key={currentMedia?.url}
                    src={currentMedia?.url}
                    alt=""
                    className="select-none"
                    draggable={false}
                    style={
                      isZoomed
                        ? {
                            width: "180vw",
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
              </motion.div>
            )}

            {/* Thumbnail strip for multiple media items */}
            {lightboxMedia.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 z-20">
                {lightboxMedia.map((media, idx) => (
                  <button
                    key={idx}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      idx === lightboxIndex
                        ? "border-kol-blue ring-2 ring-kol-blue/30"
                        : "border-kol-border/50 hover:border-kol-border opacity-60 hover:opacity-100"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(idx);
                      resetZoomState();
                    }}
                  >
                    <img
                      src={
                        media.type === "video"
                          ? media.thumbnailUrl || media.url
                          : media.url
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {media.type === "video" && (
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
    </motion.article>
  );
}
