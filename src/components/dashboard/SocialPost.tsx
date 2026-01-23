import { motion } from 'framer-motion'

export interface SocialPostData {
  id: string
  type: 'trade' | 'alert' | 'mention'
  author: {
    name: string
    handle: string
    avatar?: string
    verified?: boolean
    followers?: number
  }
  content: string
  timestamp: Date
  token?: {
    symbol: string
    address: string
    image?: string
    age?: string
    marketCap?: number
  }
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
      verified?: boolean
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

  const handleView = () => {
    if (post.tweetUrl) {
      window.open(post.tweetUrl, '_blank')
    } else {
      window.open(`https://x.com/${post.author.handle}`, '_blank')
    }
  }

  const handleHide = () => {
    // Hide user functionality
    console.log('Hide user:', post.author.handle)
  }

  return (
    <motion.article
      className="group relative w-full border-b-[3px] border-[#1f1f2e]/80"
      style={{ backgroundColor: '#0a0a0a' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {/* Header Row - Avatar, Author, Actions, Deploy */}
      <div className="flex items-center border-b border-[#2a2a3a]/60">
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
                className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 hover:ring-kol-blue/50 hover:ring-2 transition-all"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center ring-1 ring-white/10"
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
                className="font-semibold text-sm hover:underline truncate max-w-[120px] text-white"
              >
                {post.author.name}
              </button>
              {post.author.verified && (
                <svg className="w-4 h-4 flex-shrink-0 text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/>
                </svg>
              )}
              <span className="text-xs text-[#6b6b80]">{formatTime(post.timestamp)}</span>
              {/* Reply indicator */}
              {post.replyTo && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#f59e0b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 17l-5-5 5-5"/><path d="M20 18v-2a4 4 0 00-4-4H4"/>
                  </svg>
                  <span className="text-xs text-[#6b6b80]">Reply</span>
                </div>
              )}
            </div>

            {/* Handle & Followers Row */}
            <div className="flex items-center gap-1.5 text-xs text-[#6b6b80]">
              <a
                href={`https://x.com/${post.author.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-kol-blue hover:underline truncate"
              >
                @{post.author.handle}
              </a>
              {post.author.followers && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/5 text-[11px]">
                    <svg className="w-3 h-3 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                      <path d="M16 3.13a4 4 0 010 7.75"/>
                      <path d="M22 21v-2a4 4 0 00-3-3.87"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                    {formatFollowers(post.author.followers)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Actions & Deploy */}
        <div className="flex items-center h-full flex-shrink-0">
          {/* Hide button */}
          <button
            onClick={handleHide}
            className="flex items-center justify-center w-10 h-full border-l border-[#2a2a3a]/60 text-[#6b6b80] hover:text-white hover:bg-white/5 transition-all"
            title="Hide user"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>

          {/* Deploy Button */}
          {onDeploy && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                onDeploy(post)
              }}
              className="flex items-center justify-center gap-1.5 h-full px-6 border-l border-[#2a2a3a]/60 bg-kol-blue/20 hover:bg-kol-blue/40 text-white text-xs font-semibold transition-all"
              whileHover={{ backgroundColor: 'rgba(0, 123, 255, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Deploy</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 7h10v10"/><path d="M7 17L17 7"/>
              </svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-3 py-3">
        {/* Tweet Text */}
        <div className="text-sm leading-relaxed text-gray-100 mb-3">
          <span>{post.content}</span>
        </div>

        {/* Token Badge - if present */}
        {post.token && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-kol-green/10 border border-kol-green/30 mb-3">
            <div className="relative">
              {post.token.image ? (
                <img
                  src={post.token.image}
                  alt=""
                  className="w-5 h-5 rounded object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded bg-gradient-to-br from-kol-green/50 to-kol-blue/30" />
              )}
            </div>
            <span className="font-mono font-semibold text-xs text-kol-green">
              ${post.token.symbol}
            </span>
            {post.token.marketCap && (
              <span className="font-mono text-[10px] text-[#6b6b80]">
                MC: ${(post.token.marketCap / 1000).toFixed(0)}K
              </span>
            )}
          </div>
        )}

        {/* Media preview */}
        {post.mediaUrl && (
          <div className="relative mb-3 rounded-lg overflow-hidden border border-[#2a2a3a]/60 max-w-[280px]">
            <img
              src={post.mediaUrl}
              alt=""
              className="w-full h-auto max-h-[200px] object-contain bg-[#0f0f17]"
            />
          </div>
        )}

        {/* Reply Thread Quote */}
        {post.replyTo && (
          <div
            className="mt-3 pl-3 py-2.5 border-l-[3px] rounded-r-md"
            style={{ borderLeftColor: `${typeColor}60` }}
          >
            {/* Replying to link */}
            <div className="flex items-center gap-2 mb-2">
              <a
                href={post.replyTo.tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kol-blue hover:text-white transition-colors flex items-center gap-1"
              >
                <span className="text-xs font-medium">Replying to</span>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                </svg>
              </a>
            </div>

            {/* Quoted Author */}
            <div className="flex items-start gap-2.5">
              {post.replyTo.author.avatar ? (
                <img
                  src={post.replyTo.author.avatar}
                  alt={post.replyTo.author.name}
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#1f1f2e] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-medium text-gray-300 text-xs truncate">
                    {post.replyTo.author.name}
                  </span>
                  {post.replyTo.author.verified && (
                    <svg className="w-3 h-3 flex-shrink-0 text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/>
                    </svg>
                  )}
                  <span className="text-[#6b6b80] text-xs">@{post.replyTo.author.handle}</span>
                  {post.replyTo.author.followers && (
                    <>
                      <span className="text-[#6b6b80] text-xs">·</span>
                      <span className="text-[#6b6b80] text-xs flex items-center gap-0.5">
                        <svg className="w-3 h-3 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                        </svg>
                        {formatFollowers(post.replyTo.author.followers)}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-[#9999aa] text-xs leading-relaxed">
                  {post.replyTo.content}
                </div>

                {/* Reply media */}
                {post.replyTo.mediaUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-[#2a2a3a]/50 max-w-[200px]">
                    <img
                      src={post.replyTo.mediaUrl}
                      alt=""
                      className="w-full h-auto max-h-[150px] object-contain bg-[#0f0f17]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Toolbar */}
      <div className="flex items-center border-t border-[#2a2a3a]/60 h-8">
        {/* Translate section */}
        <div className="flex items-center h-full py-1 ml-2">
          <button
            className="text-[11px] flex items-center gap-1 text-[#6b6b80] hover:text-gray-200 hover:bg-white/5 px-2 h-full transition-all rounded-md"
            title="Translate"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/>
              <path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
            </svg>
            <span className="font-medium">Translate</span>
          </button>
          <button
            className="flex items-center text-[11px] hover:text-gray-200 transition-colors text-[#6b6b80] px-1"
            title="Select language"
          >
            <span className="font-semibold text-[10px] uppercase tracking-wide">en</span>
            <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Time */}
        <div className="flex items-center text-[11px] text-[#6b6b80] px-2.5 h-full">
          <span className="font-medium">{formatTimeShort(post.timestamp)}</span>
        </div>

        {/* View link */}
        <a
          href={post.tweetUrl || `https://x.com/${post.author.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6b6b80] hover:text-gray-200 text-[11px] flex items-center gap-1 px-2.5 h-full hover:bg-white/5 transition-all font-medium border-l border-[#2a2a3a]/60"
        >
          <span>View</span>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
          </svg>
        </a>
      </div>
    </motion.article>
  )
}
