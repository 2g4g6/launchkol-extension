import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SocialPost, SocialPostData } from './SocialPost'

// Mock data - tweets with different types (normal, reply, repost, quote) and media
const MOCK_POSTS: SocialPostData[] = [
  // Normal post with single image
  {
    id: '1',
    type: 'alert',
    tweetType: 'post',
    author: {
      name: 'CryptoAlerts',
      handle: 'crypto_alerts',
      followers: 8500000,
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    content: 'New token detected with unusual wallet activity. Multiple fresh wallets accumulating. Check out this chart 📊',
    timestamp: new Date(Date.now() - 13000),
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/chart1/400/300' }
    ],
    tweetUrl: 'https://x.com/crypto_alerts/status/123',
  },
  // Reply tweet
  {
    id: '2',
    type: 'mention',
    tweetType: 'reply',
    author: {
      name: 'SolanaWhales',
      handle: 'sol_whales',
      followers: 45900,
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    content: '@AlphaTrader 🫡 This is huge! Been watching this wallet for weeks.',
    timestamp: new Date(Date.now() - 120000),
    tweetUrl: 'https://x.com/sol_whales/status/124',
    replyTo: {
      author: {
        name: 'Alpha Trader',
        handle: 'AlphaTrader',
        followers: 125000,
        avatar: 'https://i.pravatar.cc/150?img=3',
      },
      content: 'Just spotted a massive whale wallet moving 2,500 SOL. Something big brewing? 👀',
      timestamp: new Date(Date.now() - 180000),
      tweetUrl: 'https://x.com/AlphaTrader/status/123',
    },
  },
  // Post with 2 images
  {
    id: '3',
    type: 'alert',
    tweetType: 'post',
    author: {
      name: 'BundleScanner',
      handle: 'bundle_scan',
      followers: 2100000,
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    content: 'Bundle detected on recent pump.fun launch. 15 wallets, 40% supply. Here are the receipts 🧾',
    timestamp: new Date(Date.now() - 600000),
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/bundle1/400/300' },
      { type: 'image', url: 'https://picsum.photos/seed/bundle2/400/300' }
    ],
    tweetUrl: 'https://x.com/bundle_scan/status/125',
  },
  // Quote tweet
  {
    id: '4',
    type: 'mention',
    tweetType: 'quote',
    author: {
      name: 'DeFiWatcher',
      handle: 'defi_watcher',
      followers: 471000,
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    content: 'What a campaign - probably the biggest I\'ve ever seen. Good job 👏',
    timestamp: new Date(Date.now() - 1500000),
    tweetUrl: 'https://x.com/defi_watcher/status/126',
    quotedTweet: {
      author: {
        name: 'SolDev',
        handle: 'solana_dev',
        followers: 890000,
        avatar: 'https://i.pravatar.cc/150?img=6',
      },
      content: 'Just launched our new token with LaunchKOL. The fees are insanely low compared to competitors. 🚀',
      media: [
        { type: 'image', url: 'https://picsum.photos/seed/launch/400/200' }
      ],
      tweetUrl: 'https://x.com/solana_dev/status/125',
    },
  },
  // Post with video
  {
    id: '5',
    type: 'alert',
    tweetType: 'post',
    author: {
      name: 'TokenScanner',
      handle: 'token_scanner',
      followers: 890000,
      avatar: 'https://i.pravatar.cc/150?img=7',
    },
    content: 'Large holder detected accumulating. Watch the full breakdown in this video 🎥',
    timestamp: new Date(Date.now() - 2000000),
    media: [
      { type: 'video', url: 'https://example.com/video.mp4', thumbnailUrl: 'https://picsum.photos/seed/video/400/300' }
    ],
    tweetUrl: 'https://x.com/token_scanner/status/127',
  },
  // Repost
  {
    id: '6',
    type: 'mention',
    tweetType: 'repost',
    author: {
      name: 'CryptoNews',
      handle: 'crypto_news',
      followers: 1200000,
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
    content: '',
    timestamp: new Date(Date.now() - 3000000),
    tweetUrl: 'https://x.com/crypto_news/status/128',
    quotedTweet: {
      author: {
        name: 'Solana',
        handle: 'solana',
        followers: 2800000,
        avatar: 'https://i.pravatar.cc/150?img=9',
      },
      content: 'Solana just hit a new ATH in daily active addresses. The ecosystem is thriving! 🌟',
      tweetUrl: 'https://x.com/solana/status/127',
    },
  },
  // Normal post (no media)
  {
    id: '7',
    type: 'alert',
    tweetType: 'post',
    author: {
      name: 'WhaleAlert',
      handle: 'whale_alert',
      followers: 3400000,
      avatar: 'https://i.pravatar.cc/150?img=10',
    },
    content: '🚨 50,000 SOL ($8.2M) transferred from unknown wallet to Binance. Potential sell pressure incoming.',
    timestamp: new Date(Date.now() - 4500000),
    tweetUrl: 'https://x.com/whale_alert/status/129',
  },
]

interface TrackerFeedProps {
  onDeploy?: (post: SocialPostData) => void
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

export function TrackerFeed({ onDeploy }: TrackerFeedProps) {
  const [posts] = useState<SocialPostData[]>(MOCK_POSTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.handle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Search Bar */}
      <motion.div
        className="relative mx-3 mt-2 mb-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Focus glow effect */}
        <div
          className={`absolute inset-0 rounded-xl transition-opacity duration-500 blur-xl -z-10 ${
            isSearchFocused ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 123, 255, 0.15) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex items-center">
          <i className={`ri-search-line absolute left-3 text-sm transition-colors duration-200 ${
            isSearchFocused ? 'text-kol-blue' : 'text-kol-text-muted'
          }`} />
          <input
            type="text"
            placeholder="Search feed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full h-9 pl-9 pr-4 bg-kol-surface/40 backdrop-blur-sm border border-kol-border/30 rounded-xl text-sm text-white placeholder:text-kol-text-muted font-body focus:border-kol-blue/50 focus:bg-kol-surface/60 transition-all duration-300"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 w-5 h-5 rounded-full bg-kol-border/50 flex items-center justify-center hover:bg-kol-border transition-colors"
            >
              <i className="ri-close-line text-xs text-kol-text-muted" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Feed Content */}
      <motion.div
        className="relative z-10 flex-1 overflow-y-auto scrollbar-thin"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <SocialPost
                key={post.id}
                post={post}
                index={index}
                onDeploy={onDeploy}
              />
            ))
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center h-full py-16 text-center px-6"
              variants={itemVariants}
            >
              {/* Empty state icon */}
              <motion.div
                className="relative mb-5"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-kol-surface-elevated/50 backdrop-blur-sm border border-kol-border/40 flex items-center justify-center">
                  <i className={`text-3xl text-kol-text-muted ${
                    searchQuery ? 'ri-search-line' : 'ri-radar-line'
                  }`} />
                </div>
                {/* Glow effect */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-50 blur-xl -z-10"
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 123, 255, 0.2) 0%, transparent 70%)',
                  }}
                />
              </motion.div>

              <motion.h3
                className="font-body font-semibold text-base text-white mb-1"
                variants={itemVariants}
              >
                {searchQuery ? 'No results found' : 'No activity yet'}
              </motion.h3>
              <motion.p
                className="font-body text-sm text-kol-text-muted max-w-[200px]"
                variants={itemVariants}
              >
                {searchQuery
                  ? `No tweets matching "${searchQuery}"`
                  : 'New tweets from tracked accounts will appear here'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom padding for scroll */}
        <div className="h-2" />
      </motion.div>
    </div>
  )
}
