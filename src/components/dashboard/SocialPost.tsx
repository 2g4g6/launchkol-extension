import { motion } from 'framer-motion'

export interface SocialPostData {
  id: string
  type: 'trade' | 'alert' | 'mention'
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
  mediaUrl?: string
  tweetUrl?: string
  replyTo?: {
    author: {
      name: string
      handle: string
      avatar?: string
      followers?: number
    }
    content: string
    mediaUrl?: string
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
                <span className="text-xs text-kol-text-muted">{formatTime(post.timestamp)}</span>
                {/* Reply indicator */}
                {post.replyTo && (
                  <div className="flex items-center gap-1">
                    <i className="ri-reply-line text-xs text-amber-400" />
                    <span className="text-xs text-kol-text-muted">Reply</span>
                  </div>
                )}
              </div>

              {/* Handle & Followers Row */}
              <div className="flex items-center gap-1.5 text-xs text-kol-text-muted">
                <a
                  href={`https://x.com/${post.author.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-kol-blue hover:underline truncate transition-colors"
                >
                  @{post.author.handle}
                </a>
                {post.author.followers && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-kol-blue/15 border border-kol-blue/30 text-[11px] text-kol-blue font-medium">
                    <i className="ri-user-follow-line text-[10px]" />
                    {formatFollowers(post.author.followers)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions & Deploy */}
          <div className="flex items-stretch flex-shrink-0">
            {/* Hide button */}
            <button
              onClick={handleHide}
              className="flex items-center justify-center w-11 py-4 border-l border-kol-border/40 text-kol-text-muted hover:text-white hover:bg-kol-surface/60 transition-all duration-200"
              title="Hide user"
            >
              <i className="ri-eye-off-line text-sm" />
            </button>

            {/* Deploy Button */}
            {onDeploy && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeploy(post)
                }}
                className="flex items-center justify-center gap-1.5 px-5 py-4 border-l border-kol-border/40 bg-kol-blue/25 hover:bg-kol-blue/40 text-white text-xs font-semibold transition-all duration-300"
                whileTap={{ scale: 0.98 }}
              >
                <span>Deploy</span>
                <i className="ri-arrow-right-up-line text-sm" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="px-3.5 py-3">
          {/* Tweet Text */}
          <p className="font-body text-sm text-kol-text-secondary leading-relaxed mb-2.5">
            {post.content}
          </p>

          {/* Media preview */}
          {post.mediaUrl && (
            <div className="relative mb-2.5 rounded-lg overflow-hidden border border-kol-border/30 max-w-[280px]">
              <img
                src={post.mediaUrl}
                alt=""
                className="w-full h-auto max-h-[200px] object-contain bg-kol-surface"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Reply Thread Quote */}
          {post.replyTo && (
            <div
              className="mt-2 pl-3 py-2.5 border-l-[3px] rounded-r-lg bg-kol-surface/30"
              style={{ borderLeftColor: `${typeColor}50` }}
            >
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
                    <span className="text-kol-text-muted text-xs">@{post.replyTo.author.handle}</span>
                    {post.replyTo.author.followers && (
                      <>
                        <span className="text-kol-text-muted/60 text-xs">·</span>
                        <span className="text-kol-text-muted text-xs flex items-center gap-0.5">
                          <i className="ri-group-line text-[9px]" />
                          {formatFollowers(post.replyTo.author.followers)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-kol-text-muted text-xs leading-relaxed">
                    {post.replyTo.content}
                  </p>

                  {/* Reply media */}
                  {post.replyTo.mediaUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-kol-border/30 max-w-[200px]">
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
          {/* Translate section */}
          <div className="flex items-center h-full py-1 ml-2">
            <button
              className="text-[11px] flex items-center gap-1 text-kol-text-muted hover:text-white hover:bg-kol-surface/60 px-2 h-full transition-all duration-200 rounded-md"
              title="Translate"
            >
              <i className="ri-translate-2 text-xs" />
              <span className="font-medium">Translate</span>
            </button>
            <button
              className="flex items-center text-[11px] hover:text-white transition-colors duration-200 text-kol-text-muted px-1"
              title="Select language"
            >
              <span className="font-semibold text-[10px] uppercase tracking-wide">en</span>
              <i className="ri-arrow-down-s-line text-xs opacity-60" />
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Time */}
          <div className="flex items-center text-[11px] text-kol-text-muted px-2.5 h-full font-mono">
            <span>{formatTimeShort(post.timestamp)}</span>
          </div>

          {/* View link */}
          <a
            href={post.tweetUrl || `https://x.com/${post.author.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-kol-text-muted hover:text-white text-[11px] flex items-center gap-1 px-2.5 h-full hover:bg-kol-surface/60 transition-all duration-200 font-medium border-l border-kol-border/30"
          >
            <span>View</span>
            <i className="ri-external-link-line text-xs" />
          </a>
        </div>
      </div>
    </motion.article>
  )
}
