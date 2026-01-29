import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SocialPost, SocialPostData } from './SocialPost'
import { Tooltip } from '../ui/Tooltip'
import { FeedSettingsModal } from './FeedSettings'

type TweetTypeFilter = 'all' | 'posts' | 'replies' | 'quotes' | 'reposts' | 'deleted' | 'following'

const TWEET_TYPE_FILTERS: { id: TweetTypeFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'ri-list-check' },
  { id: 'posts', label: 'Posts', icon: 'ri-chat-1-line' },
  { id: 'replies', label: 'Replies', icon: 'ri-reply-line' },
  { id: 'quotes', label: 'Quotes', icon: 'ri-double-quotes-l' },
  { id: 'reposts', label: 'Reposts', icon: 'ri-repeat-line' },
  { id: 'deleted', label: 'Deleted', icon: 'ri-delete-bin-line' },
  { id: 'following', label: 'Following', icon: 'ri-user-follow-line' },
]

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
  // Reply tweet with nested reply (reply to a reply)
  {
    id: '2',
    type: 'mention',
    tweetType: 'reply',
    author: {
      name: 'Alex Becker',
      handle: 'ZssBecker',
      followers: 1400000,
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    content: 'also FYI I\'m down like 35 mil. I ate shit with everyone else (as I expected if ETH failed to bust its ATH). I didn\'t dump on my viewers/followers and ride off into the sunset. I spoke exactly what I believe and was absolutely upfront with the risk and stuck to what I said.\n\nIm sorry your going to have to find someone else to pin all your ridiculous behavior our.\n\ngo watch my videos where I spend 20% of each video explaining risk and screaming such things like\n\n-IF YOUR NEW STICK TO BIG CAPS\n-DO NOT INVEST A LOT YOU ARE GOING TO LOSE\n-THIS IS MEGA HIGH RISK, BE PREPARED FOR THE DOWNSIDE\n\nYou take responsibility you fucking child.',
    timestamp: new Date(Date.now() - 240000),
    tweetUrl: 'https://x.com/ZssBecker/status/124',
    replyTo: {
      author: {
        name: 'iTush',
        handle: 'iTusharTSS',
        followers: 2500,
        avatar: 'https://i.pravatar.cc/150?img=11',
      },
      content: '@ZssBecker @intocryptoverse @NewsAsset Well that is. Well let me tell you something I been following you and some other so called crypto youtuber. Have you ever took the responsibility that what your words can do? You may have a best life but you have killed so many young lives. Just a little proof. I deleted mostly',
      timestamp: new Date(Date.now() - 1500000),
      tweetUrl: 'https://x.com/iTusharTSS/status/123',
      media: [
        { type: 'image', url: 'https://picsum.photos/seed/portfolio1/400/300' },
        { type: 'image', url: 'https://picsum.photos/seed/portfolio2/400/300' }
      ],
      replyTo: {
        author: {
          name: 'Alex Becker',
          handle: 'ZssBecker',
          followers: 1400000,
          avatar: 'https://i.pravatar.cc/150?img=2',
        },
        content: 'The market is brutal right now. Remember what I always say - only invest what you can afford to lose. This is not financial advice.',
        timestamp: new Date(Date.now() - 3600000),
        tweetUrl: 'https://x.com/ZssBecker/status/122',
      },
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
      timestamp: new Date(Date.now() - 1800000),
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
      timestamp: new Date(Date.now() - 3600000),
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
  // Post with rich link preview
  {
    id: '8',
    type: 'alert',
    tweetType: 'post',
    author: {
      name: 'Bloomberg',
      handle: 'business',
      followers: 9700000,
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    content: 'Trump wants to cap credit card interest at 10%. @sarahsholder and @cfb_18 discuss what his plan would mean for banks and borrowers. Listen to the Big Take podcast. https://www.bloomberg.com/news/articles/2026-01-15/trump-credit-card-interest-rate-cap',
    timestamp: new Date(Date.now() - 180000),
    tweetUrl: 'https://x.com/business/status/130',
    linkPreview: {
      url: 'https://www.bloomberg.com/news/articles/2026-01-15/trump-credit-card-interest-rate-cap',
      title: 'Trump\'s Credit Card Interest Rate Cap Plan: What It Would Mean for Banks',
      description: 'President Trump\'s proposal to cap credit card interest rates at 10% could reshape the consumer lending industry. Here\'s what banks and borrowers need to know.',
      image: 'https://picsum.photos/seed/bloomberg/600/400',
      siteName: 'Bloomberg',
      favicon: 'https://www.bloomberg.com/favicon.ico',
    },
  },
  // Post with link (no image preview)
  {
    id: '9',
    type: 'mention',
    tweetType: 'post',
    author: {
      name: 'CoinDesk',
      handle: 'CoinDesk',
      followers: 2100000,
      avatar: 'https://i.pravatar.cc/150?img=13',
    },
    content: 'Breaking: SEC approves new crypto ETF framework. Full details here: https://www.coindesk.com/policy/sec-crypto-etf-framework',
    timestamp: new Date(Date.now() - 420000),
    tweetUrl: 'https://x.com/CoinDesk/status/131',
    linkPreview: {
      url: 'https://www.coindesk.com/policy/sec-crypto-etf-framework',
      title: 'SEC Approves New Crypto ETF Framework, Opening Door for More Products',
      description: 'The Securities and Exchange Commission has approved a new regulatory framework that could pave the way for additional cryptocurrency exchange-traded funds.',
      siteName: 'CoinDesk',
    },
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [tweetTypeFilter, setTweetTypeFilter] = useState<TweetTypeFilter>('all')
  const [autoTranslate, setAutoTranslate] = useState(false)
  const [pauseOnHover, setPauseOnHover] = useState(true)

  const TWEET_TYPE_MAP: Record<TweetTypeFilter, string | undefined> = {
    all: undefined,
    posts: 'post',
    replies: 'reply',
    quotes: 'quote',
    reposts: 'repost',
    deleted: undefined,
    following: undefined,
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.handle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = tweetTypeFilter === 'all' || post.tweetType === TWEET_TYPE_MAP[tweetTypeFilter]
    return matchesSearch && matchesType
  })

  const renderFeedFilterRow = () => (
    <div className="flex items-center justify-between gap-2">
      {/* Tweet type filter pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {TWEET_TYPE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setTweetTypeFilter(filter.id)}
            className={`flex items-center gap-1 h-6 px-2 rounded text-xs font-medium border whitespace-nowrap transition-colors ${
              tweetTypeFilter === filter.id
                ? 'bg-kol-blue/15 text-kol-blue border-kol-blue/50'
                : 'bg-kol-surface/45 border-kol-border text-kol-text-muted hover:bg-kol-surface-elevated'
            }`}
          >
            <i className={`${filter.icon} text-[10px]`} />
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <Tooltip content="Auto-translate tweets" position="bottom">
          <button
            onClick={() => setAutoTranslate(!autoTranslate)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
              autoTranslate
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated'
            }`}
          >
            <i className="ri-translate text-xs" />
          </button>
        </Tooltip>
        <Tooltip content="Pause feed on hover" position="bottom">
          <button
            onClick={() => setPauseOnHover(!pauseOnHover)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
              pauseOnHover
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated'
            }`}
          >
            <i className="ri-pause-circle-line text-xs" />
          </button>
        </Tooltip>
        <Tooltip content="Default launch platform" position="bottom">
          <button
            className="w-6 h-6 rounded flex items-center justify-center text-kol-text-muted hover:bg-kol-surface-elevated transition-colors"
          >
            <i className="ri-rocket-line text-xs" />
          </button>
        </Tooltip>
      </div>
    </div>
  )

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Container for search and feed */}
      <div className="flex flex-col h-full lg:bg-kol-surface/50 lg:backdrop-blur-sm lg:border lg:border-kol-border/70 lg:rounded-xl overflow-hidden">
        {/* Search Bar + Filters */}
        <motion.div
          className="relative px-3 pt-3 pb-2 space-y-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Tweet type filters & controls */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {renderFeedFilterRow()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search input */}
          <div className="relative">
            {/* Focus glow effect */}
            <div
              className={`absolute inset-0 rounded-xl transition-opacity duration-500 blur-xl -z-10 ${
                isSearchFocused ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(0, 123, 255, 0.15) 0%, transparent 70%)',
              }}
            />

            <div className={`relative flex items-center bg-kol-surface/50 border rounded-xl transition-all duration-300 ${
              isSearchFocused ? 'border-kol-blue/50' : 'border-kol-border/70'
            }`}>
              {/* Chevron toggle for filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute left-2 lg:left-2 top-1/2 -translate-y-1/2 w-6 h-6 lg:w-5 lg:h-5 rounded flex items-center justify-center text-kol-text-muted hover:text-white transition-colors z-10"
              >
                <motion.i
                  className="ri-arrow-down-s-line text-base lg:text-sm"
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
              <i className={`ri-search-line absolute left-9 lg:left-8 top-1/2 -translate-y-1/2 text-base lg:text-sm transition-colors duration-200 ${
                isSearchFocused ? 'text-kol-blue' : 'text-kol-text-tertiary'
              }`} />
              <input
                type="text"
                placeholder="Search feed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 h-11 lg:h-9 pl-16 lg:pl-14 pr-2 bg-transparent border-0 rounded-xl text-base lg:text-sm text-white placeholder:text-kol-text-tertiary font-body focus:outline-none transition-all duration-300"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-1 lg:gap-0.5 pr-2">
                {/* Clear search */}
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className="w-9 h-9 lg:w-7 lg:h-7 rounded-lg flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <i className="ri-close-line text-base lg:text-sm" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="w-px h-5 lg:h-4 bg-kol-border/40 mx-1" />

                {/* Settings Button */}
                <Tooltip content="Feed settings">
                  <motion.button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="flex items-center gap-2 lg:gap-1.5 px-3 lg:px-2.5 py-2 lg:py-1.5 rounded-lg text-kol-text-tertiary hover:text-white hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className="ri-settings-3-line text-base lg:text-sm" />
                    <span className="text-sm lg:text-xs font-medium">Settings</span>
                  </motion.button>
                </Tooltip>
              </div>
            </div>
          </div>
        </motion.div>

      {/* Feed Content */}
      <motion.div
        className="relative z-10 flex-1 overflow-y-auto scrollbar-styled"
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

      {/* Settings Modal */}
      <FeedSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  )
}
