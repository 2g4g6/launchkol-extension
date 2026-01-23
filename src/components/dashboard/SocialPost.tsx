import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface MediaItem {
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
}

export interface SocialPostData {
  id: string
  type: 'trade' | 'alert' | 'mention'
  tweetType?: 'post' | 'reply' | 'repost' | 'quote'
  author: {
    name: string
    handle: string
    avatar?: string
    followers?: number
  }
  content: string
  timestamp: Date
  tradeInfo?: {
    action: 'buy' | 'sell'
    amount: number
    price: number
  }
  media?: MediaItem[]
  mediaUrl?: string // legacy single image support
  tweetUrl?: string
  replyTo?: {
    author: {
      name: string
      handle: string
      avatar?: string
      followers?: number
    }
    content: string
    timestamp?: Date
    media?: MediaItem[]
    mediaUrl?: string
    tweetUrl?: string
  }
  quotedTweet?: {
    author: {
      name: string
      handle: string
      avatar?: string
      followers?: number
    }
    content: string
    media?: MediaItem[]
    tweetUrl?: string
  }
}

interface SocialPostProps {
  post: SocialPostData
  index: number
  onDeploy?: (post: SocialPostData) => void
}

// Format follower count (e.g., 8500000 -> "8.5M")
function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export function SocialPost({ post, index, onDeploy }: SocialPostProps) {
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const isLightboxOpen = lightboxImages.length > 0

  const openLightbox = (images: string[], startIndex: number = 0) => {
    setLightboxImages(images)
    setLightboxIndex(startIndex)
    setIsZoomed(false)
  }

  const closeLightbox = () => {
    setLightboxImages([])
    setLightboxIndex(0)
    setIsZoomed(false)
  }

  const goToPrevious = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1))
    setIsZoomed(false)
  }

  const goToNext = () => {
    setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return

      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, lightboxImages.length])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const formatTimeShort = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Generate avatar initials
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // Get type styling
  const getTypeColor = () => {
    switch (post.type) {
      case 'alert':
        return '#ff4d4f'
      case 'mention':
        return '#007bff'
      default:
        return '#007bff'
    }
  }

  const typeColor = getTypeColor()

  const handleHide = () => {
    console.log('Hide user:', post.author.handle)
  }

  // Render content with @mentions highlighted in blue
  const renderContent = (text: string) => {
    const parts = text.split(/(@\w+)/g)
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const handle = part.slice(1)
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
        )
      }
      return part
    })
  }

  return (
    <motion.article
      className="group relative mx-3 my-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1]
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
      <div className="relative bg-kol-surface-elevated/60 backdrop-blur-md border border-kol-border/50 rounded-xl overflow-hidden group-hover:border-kol-border/70 group-hover:bg-kol-surface-elevated/70 transition-all duration-300">

        {/* Header Row - Avatar, Author, Actions, Deploy */}
        <div className="flex items-stretch border-b border-kol-border/40 min-h-[60px]">
          {/* Left Section - Avatar & Author Info */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 flex-1 min-w-0">
            {/* Avatar */}
            <button
              onClick={() => window.open(`https://x.com/${post.author.handle}`, '_blank')}
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
                  onClick={() => window.open(`https://x.com/${post.author.handle}`, '_blank')}
                  className="font-body font-semibold text-sm hover:underline truncate max-w-[120px] text-white"
                >
                  {post.author.name}
                </button>
                <span className="text-xs text-gray-400">{formatTime(post.timestamp)}</span>
                {/* Tweet type indicator */}
                {post.tweetType === 'reply' && (
                  <div className="flex items-center gap-1">
                    <i className="ri-reply-line text-xs text-kol-blue" />
                    <span className="text-xs text-kol-blue">Reply</span>
                  </div>
                )}
                {post.tweetType === 'repost' && (
                  <div className="flex items-center gap-1">
                    <i className="ri-repeat-line text-xs text-kol-green" />
                    <span className="text-xs text-kol-green">Repost</span>
                  </div>
                )}
                {post.tweetType === 'quote' && (
                  <div className="flex items-center gap-1">
                    <i className="ri-chat-quote-line text-xs text-purple-400" />
                    <span className="text-xs text-purple-400">Quote</span>
                  </div>
                )}
              </div>

              {/* Handle & Followers Row */}
              <div className="flex items-center gap-1.5 text-xs">
                <a
                  href={`https://x.com/${post.author.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-kol-blue hover:underline truncate transition-colors"
                >
                  @{post.author.handle}
                </a>
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
                e.stopPropagation()
                onDeploy(post)
              }}
              className="flex items-center justify-center gap-2 px-14 py-4 border-l border-kol-border/40 bg-kol-blue/25 hover:bg-kol-blue/40 text-white text-sm font-semibold transition-all duration-300"
              whileTap={{ scale: 0.98 }}
            >
              <span>Deploy</span>
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

          {/* Media preview - multiple images or video */}
          {(post.media && post.media.length > 0) && (
            <div className={`mb-2.5 w-full ${post.media.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
              {post.media.map((item, idx) => {
                const allImageUrls = post.media!.map(m => m.type === 'video' ? (m.thumbnailUrl || m.url) : m.url)
                return (
                <div
                  key={idx}
                  className={`relative bg-kol-surface flex items-center justify-center rounded-lg overflow-hidden border border-kol-border/30 cursor-pointer hover:border-kol-blue/50 transition-colors ${
                    post.media!.length === 1 ? 'h-[240px]' : 'h-[140px]'
                  }`}
                  onClick={() => openLightbox(allImageUrls, idx)}
                >
                  {item.type === 'video' ? (
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
              )})}
            </div>
          )}

          {/* Legacy single image support */}
          {!post.media && post.mediaUrl && (
            <div
              className="relative mb-2.5 rounded-lg overflow-hidden border border-kol-border/30 max-w-[280px] cursor-pointer hover:border-kol-blue/50 transition-colors"
              onClick={() => openLightbox([post.mediaUrl!])}
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
                <div className="flex items-center gap-2 mb-1.5">
                  {post.quotedTweet.author.avatar ? (
                    <img
                      src={post.quotedTweet.author.avatar}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-kol-surface-elevated" />
                  )}
                  <span className="font-body font-medium text-xs text-white">{post.quotedTweet.author.name}</span>
                  <a
                    href={`https://x.com/${post.quotedTweet.author.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-kol-blue hover:underline text-xs"
                  >
                    @{post.quotedTweet.author.handle}
                  </a>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">{post.quotedTweet.content}</p>
                {post.quotedTweet.media && post.quotedTweet.media.length > 0 && (
                  <div
                    className="mt-2 rounded-lg overflow-hidden bg-kol-surface border border-kol-border/30 flex justify-center items-center h-[200px] cursor-pointer hover:border-kol-blue/50 transition-colors"
                    onClick={() => openLightbox(post.quotedTweet!.media!.map(m => m.url))}
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
            <div className="mt-2 pl-3 py-2.5 border-l-[3px] border-kol-blue/50 rounded-r-lg bg-kol-surface/30">
              {/* Replying to link */}
              <div className="flex items-center gap-2 mb-2">
                <a
                  href={post.replyTo.tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kol-blue hover:text-kol-blue-hover transition-colors flex items-center gap-1"
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
                      className="text-gray-400 hover:text-kol-blue hover:underline text-xs"
                    >
                      @{post.replyTo.author.handle}
                    </a>
                    {post.replyTo.timestamp && (
                      <>
                        <span className="text-gray-500 text-xs">·</span>
                        <span className="text-gray-400 text-xs">{formatTime(post.replyTo.timestamp)}</span>
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
                    {post.replyTo.content}
                  </p>

                  {/* Reply media */}
                  {post.replyTo.mediaUrl && (
                    <div
                      className="mt-2 rounded-lg overflow-hidden border border-kol-border/30 max-w-[200px] cursor-pointer hover:border-kol-blue/50 transition-colors"
                      onClick={() => openLightbox([post.replyTo!.mediaUrl!])}
                    >
                      <img
                        src={post.replyTo.mediaUrl}
                        alt=""
                        className="w-full h-auto max-h-[120px] object-contain bg-kol-surface"
                      />
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
            <button
              onClick={handleHide}
              className="flex items-center justify-center w-9 h-full text-gray-400 hover:text-white hover:bg-kol-surface/60 transition-all duration-200"
              title="Hide"
            >
              <i className="ri-close-line text-sm" />
            </button>
            <div className="w-px h-4 bg-kol-border/40" />
            <button
              className="flex items-center justify-center w-9 h-full text-gray-400 hover:text-white hover:bg-kol-surface/60 transition-all duration-200"
              title="Notify"
            >
              <i className="ri-notification-line text-sm" />
            </button>
            <div className="w-px h-4 bg-kol-border/40" />
          </div>

          {/* Translate section */}
          <div className="flex items-center h-full py-1 ml-1">
            <button
              className="text-[11px] flex items-center gap-1 text-gray-400 hover:text-white hover:bg-kol-surface/60 px-2 h-full transition-all duration-200 rounded-md"
              title="Translate"
            >
              <i className="ri-translate-2 text-xs" />
              <span className="font-medium">Translate</span>
            </button>
            <button
              className="flex items-center text-[11px] hover:text-white transition-colors duration-200 text-gray-400 px-1"
              title="Select language"
            >
              <span className="font-semibold text-[10px] uppercase tracking-wide">en</span>
              <i className="ri-arrow-down-s-line text-xs opacity-60" />
            </button>
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
                e.stopPropagation()
                closeLightbox()
              }}
            >
              <i className="ri-close-line text-xl" />
            </button>

            {/* Image counter */}
            {lightboxImages.length > 1 && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-kol-surface-elevated/80 border border-kol-border/50 text-sm text-gray-300 font-mono z-20">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            )}

            {/* Navigation arrows */}
            {lightboxImages.length > 1 && (
              <>
                {/* Previous button */}
                <button
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 hover:bg-kol-surface-elevated hover:border-kol-border text-gray-400 hover:text-white transition-all duration-200 z-20"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                >
                  <i className="ri-arrow-left-s-line text-2xl" />
                </button>

                {/* Next button */}
                <button
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 hover:bg-kol-surface-elevated hover:border-kol-border text-gray-400 hover:text-white transition-all duration-200 z-20"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                >
                  <i className="ri-arrow-right-s-line text-2xl" />
                </button>
              </>
            )}

            {/* Zoom hint */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-kol-surface-elevated/60 border border-kol-border/30 text-xs text-gray-500 z-20">
              {isZoomed ? 'Click to zoom out' : 'Click image to zoom'}
            </div>

            {/* Image container with zoom */}
            <motion.div
              className={`relative flex items-center justify-center ${isZoomed ? 'cursor-zoom-out overflow-auto max-w-full max-h-full' : 'cursor-zoom-in max-w-[90vw] max-h-[85vh]'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxImages[lightboxIndex]}
                  src={lightboxImages[lightboxIndex]}
                  alt=""
                  className={`rounded-lg transition-all duration-300 ${
                    isZoomed
                      ? 'max-w-none max-h-none w-auto h-auto'
                      : 'max-w-full max-h-[85vh] object-contain'
                  }`}
                  style={isZoomed ? { transform: 'scale(2)', transformOrigin: 'center center' } : {}}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsZoomed(!isZoomed)
                  }}
                />
              </AnimatePresence>
            </motion.div>

            {/* Thumbnail strip for multiple images */}
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-kol-surface-elevated/80 border border-kol-border/50 z-20">
                {lightboxImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      idx === lightboxIndex
                        ? 'border-kol-blue ring-2 ring-kol-blue/30'
                        : 'border-kol-border/50 hover:border-kol-border opacity-60 hover:opacity-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightboxIndex(idx)
                      setIsZoomed(false)
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
