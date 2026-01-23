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

  // Generate avatar initials
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // Get type styling
  const getTypeStyles = () => {
    switch (post.type) {
      case 'alert':
        return { color: '#ff4d4f', icon: 'ri-alarm-warning-fill', label: 'Alert' }
      case 'mention':
        return { color: '#007bff', icon: 'ri-at-fill', label: 'Mention' }
      default:
        return { color: '#007bff', icon: 'ri-chat-1-fill', label: 'Tweet' }
    }
  }

  const typeStyles = getTypeStyles()

  const handleView = () => {
    if (post.tweetUrl) {
      window.open(post.tweetUrl, '_blank')
    } else {
      window.open(`https://x.com/${post.author.handle}`, '_blank')
    }
  }

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {/* Card */}
      <div className="relative mx-3 my-2 rounded-xl overflow-hidden">
        {/* Hover glow effect */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${typeStyles.color}20 0%, transparent 70%)`,
          }}
        />

        {/* Card background - glass-morphism */}
        <div className="relative bg-kol-surface-elevated/40 backdrop-blur-md border border-kol-border/40 rounded-xl p-3.5 group-hover:border-kol-border/60 group-hover:bg-kol-surface-elevated/60 transition-all duration-300">

          {/* Header: Avatar + Author info + Actions */}
          <div className="flex items-start gap-2.5 mb-2">
            {/* Avatar with type indicator */}
            <div className="relative flex-shrink-0">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-kol-border/30"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-kol-border/30"
                  style={{
                    background: `linear-gradient(135deg, ${typeStyles.color}40 0%, ${typeStyles.color}15 100%)`,
                  }}
                >
                  <span className="font-body font-bold text-sm text-white">
                    {getInitials(post.author.name)}
                  </span>
                </div>
              )}
              {/* Type indicator badge */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-kol-surface-elevated flex items-center justify-center"
                style={{
                  background: typeStyles.color,
                  boxShadow: `0 0 8px ${typeStyles.color}60`
                }}
              >
                <i className={`text-[8px] text-white ${typeStyles.icon}`} />
              </div>
            </div>

            {/* Author info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-body font-semibold text-sm text-white truncate">
                  {post.author.name}
                </span>
                {post.author.verified && (
                  <div className="relative">
                    <i className="ri-verified-badge-fill text-xs text-kol-blue" />
                    <div className="absolute inset-0 bg-kol-blue/30 blur-sm -z-10" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[13px]">
                <span className="font-body text-kol-text-muted truncate">
                  @{post.author.handle}
                </span>
                {post.author.followers && (
                  <>
                    <span className="text-kol-text-muted/60">·</span>
                    <span className="font-mono text-kol-text-tertiary flex items-center gap-0.5">
                      <i className="ri-group-line text-[11px]" />
                      {formatFollowers(post.author.followers)}
                    </span>
                  </>
                )}
                <span className="text-kol-text-muted/60">·</span>
                <span className="font-mono text-kol-text-muted">
                  {formatTime(post.timestamp)}
                </span>
              </div>
            </div>

            {/* Quick action buttons - top right */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* View button */}
              <motion.button
                onClick={handleView}
                className="h-7 px-2.5 rounded-lg bg-kol-surface/60 border border-kol-border/30 text-kol-text-muted hover:text-white hover:border-kol-border/50 transition-all flex items-center gap-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[10px] font-semibold">View</span>
                <i className="ri-external-link-line text-[10px]" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <p className="font-body text-sm text-kol-text-secondary leading-relaxed mb-2.5">
            {post.content}
          </p>

          {/* Media preview */}
          {post.mediaUrl && (
            <div className="relative mb-2.5 rounded-lg overflow-hidden border border-kol-border/30">
              <img
                src={post.mediaUrl}
                alt=""
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          {/* Footer: Token badge + Deploy button */}
          <div className="flex items-center justify-between pt-2 border-t border-kol-border/20">
            {/* Token badge */}
            {post.token ? (
              <motion.div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-kol-surface/60 border border-kol-border/30"
                whileHover={{ scale: 1.02, borderColor: 'rgba(0, 196, 107, 0.4)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  {post.token.image ? (
                    <img
                      src={post.token.image}
                      alt=""
                      className="w-5 h-5 rounded object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-kol-green/40 to-kol-blue/30" />
                  )}
                  {/* Token glow */}
                  <div className="absolute inset-0 rounded bg-kol-green/30 blur-sm -z-10" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono font-semibold text-[11px] text-kol-green leading-none">
                    ${post.token.symbol}
                  </span>
                  {post.token.marketCap && (
                    <span className="font-mono text-[9px] text-kol-text-muted leading-none mt-0.5">
                      MC: ${(post.token.marketCap / 1000).toFixed(0)}K
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <div />
            )}

            {/* Deploy button */}
            {onDeploy && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeploy(post)
                }}
                className="relative h-8 px-4 rounded-lg font-body font-semibold text-xs overflow-hidden group/btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Button gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-kol-blue to-kol-blue-hover transition-all duration-300" />
                {/* Glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: '0 0 20px rgba(0, 123, 255, 0.4)' }}
                />
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent shimmer" />
                </div>
                {/* Button content */}
                <span className="relative z-10 flex items-center gap-1.5 text-white">
                  <i className="ri-rocket-2-fill text-[11px]" />
                  Deploy
                  <i className="ri-arrow-right-s-line text-sm" />
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
