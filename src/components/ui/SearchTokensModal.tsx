import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Tooltip } from './Tooltip'
import { QuickLinkPopover } from './QuickLinkPopover'
import { WalletFilterDropdown, SavedWallet } from './WalletFilterDropdown'
import { HorizontalScrollContainer } from './HorizontalScrollContainer'
import { SourceTweetPopoverContent } from '../dashboard/popovers/SourceTweetPopover'
import { PlatformCreatorPopoverContent } from '../dashboard/popovers/PlatformCreatorPopover'
import { TokenInfoPopoverContent } from '../dashboard/popovers/TokenInfoPopover'
import { SocialPost } from '../dashboard/SocialPost'
import type { SocialPostData } from '../dashboard/SocialPost'
import type { TokenSecurityInfo } from '../dashboard/popovers/TokenInfoPopover'
import type { CreatorInfo } from '../dashboard/popovers/PlatformCreatorPopover'
import type { Recipient } from '../dashboard/CoinCard'

// ============================================================================
// Types
// ============================================================================

export type PlatformType = 'pump' | 'bonk' | 'bags' | 'mayhem' | 'fourmeme'
export type TweetType = 'tweet' | 'reply' | 'retweet' | 'quote' | 'pin' | 'follow' | 'delete' | 'profile'

export interface TokenResult {
  address: string
  name: string
  ticker: string
  image?: string
  platform: PlatformType
  age: string
  marketCap: string
  volume: string
  liquidity: string
  twitterUrl?: string
  tweetType?: TweetType
  websiteUrl?: string
  telegramUrl?: string
  axiomUrl?: string
  creatorWallet?: string
  isOwned?: boolean
  tokenSecurity?: TokenSecurityInfo
  creator?: CreatorInfo
  sourceTweet?: SocialPostData
  progressPercent?: number
  buyVolumeUsd?: number
  sellVolumeUsd?: number
  recipients?: Recipient[]
  platformFee?: string
}

export interface SearchTokensModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken: (token: TokenResult) => void
  onManageToken?: (token: TokenResult) => void
  onCloneToken?: (token: TokenResult) => void
  userWalletAddress?: string
  initialQuery?: string
  solPrice?: number
}

// ============================================================================
// Constants
// ============================================================================

const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const

type PlatformFilter = 'all' | PlatformType
type SortOption = 'time' | 'trending' | 'volume' | 'liquidity'

const PLATFORM_FILTERS: { id: PlatformFilter; label: string; icon?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pump', label: 'Pump', icon: '/images/pump.svg' },
  { id: 'bonk', label: 'Bonk', icon: '/images/bonk.svg' },
  { id: 'bags', label: 'Bags', icon: '/images/bags.svg' },
  { id: 'mayhem', label: 'Mayhem', icon: '/images/mayhem.svg' },
  { id: 'fourmeme', label: 'Four', icon: '/images/fourmeme.svg' },
]

const SORT_OPTIONS: { id: SortOption; icon: string; label: string }[] = [
  { id: 'time', icon: 'ri-time-line', label: 'Recent' },
  { id: 'trending', icon: 'ri-fire-line', label: 'Trending' },
  { id: 'volume', icon: 'ri-bar-chart-line', label: 'Volume' },
  { id: 'liquidity', icon: 'ri-drop-line', label: 'Liquidity' },
]

const WALLET_FILTER_STORAGE_KEY = 'launchkol_wallet_filter'

// Platform badge colors
const PLATFORM_COLORS: Record<PlatformType, string> = {
  pump: 'bg-green-500/20 border-green-500/50',
  bonk: 'bg-orange-500/20 border-orange-500/50',
  bags: 'bg-purple-500/20 border-purple-500/50',
  mayhem: 'bg-red-500/20 border-red-500/50',
  fourmeme: 'bg-pink-500/20 border-pink-500/50',
}

// Platform icons for badges
const PLATFORM_ICONS: Record<PlatformType, string> = {
  pump: '/images/pump.svg',
  bonk: '/images/bonk.svg',
  bags: '/images/bags.svg',
  mayhem: '/images/mayhem.svg',
  fourmeme: '/images/fourmeme.svg',
}

// Platform display names for tooltips
const PLATFORM_NAMES: Record<PlatformType, string> = {
  pump: 'Pump.fun',
  bonk: 'Bonk',
  bags: 'Bags',
  mayhem: 'Mayhem',
  fourmeme: 'Four.meme',
}

// Platform URL patterns
const PLATFORM_URL_PATTERNS: Record<PlatformType, string> = {
  pump: 'https://pump.fun/{address}',
  bonk: 'https://bonk.fun/{address}',
  bags: 'https://bags.fm/{address}',
  mayhem: 'https://mayhem.fun/{address}',
  fourmeme: 'https://4meme.fun/{address}',
}

// Axiom Icon Component
function AxiomIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 36 36" fill="currentColor" className={className}>
      <path d="M24.1384 17.3876H11.8623L18.0001 7.00012L24.1384 17.3876Z" />
      <path d="M31 29.0003L5 29.0003L9.96764 20.5933L26.0324 20.5933L31 29.0003Z" />
    </svg>
  )
}

// Tweet Type Helpers
function getTweetTypeIcon(type?: TweetType): string {
  switch (type) {
    case 'reply': return 'ri-reply-line'
    case 'retweet': return 'ri-repeat-2-line'
    case 'quote': return 'ri-chat-quote-line'
    case 'pin': return 'ri-pushpin-line'
    case 'follow': return 'ri-user-add-line'
    case 'delete': return 'ri-delete-bin-line'
    case 'profile': return 'ri-user-settings-line'
    case 'tweet':
    default: return 'ri-quill-pen-line'
  }
}

function getTweetTypeColor(type?: TweetType): string {
  switch (type) {
    case 'reply': return '#00c46b'
    case 'retweet': return '#00c46b'
    case 'quote': return '#ff9500'
    case 'pin': return '#ffd700'
    case 'follow': return '#ff4d4f'
    case 'delete': return '#ff6b6b'
    case 'profile': return '#8b5cf6'
    case 'tweet':
    default: return '#00bfa6'
  }
}

function getTweetTypeLabel(type?: TweetType): string {
  switch (type) {
    case 'reply': return 'View reply'
    case 'retweet': return 'View retweet'
    case 'quote': return 'View quote tweet'
    case 'pin': return 'View pinned tweet'
    case 'follow': return 'View follow'
    case 'delete': return 'View deleted tweet'
    case 'profile': return 'View profile update'
    case 'tweet':
    default: return 'View source tweet'
  }
}

// Platform ring solid colors (for popover content)
const PLATFORM_RING_COLORS: Record<PlatformType, string> = {
  pump: '#00c46b',
  bonk: '#f97316',
  bags: '#047857',
  mayhem: '#ff4d4f',
  fourmeme: '#ec4899',
}

// Platform ring gradients (matching Axiom style)
const PLATFORM_RING_GRADIENTS: Record<PlatformType, string> = {
  pump: 'linear-gradient(219deg, #00FF88 0%, #00c46b 49%, #009950 100%)',
  bonk: 'linear-gradient(219deg, #FFA500 0%, #f97316 49%, #CC5500 100%)',
  bags: 'linear-gradient(219deg, #C084FC 0%, #a855f7 49%, #7C3AED 100%)',
  mayhem: 'linear-gradient(219deg, #FF6B6B 0%, #ff4d4f 49%, #CC3333 100%)',
  fourmeme: 'linear-gradient(219deg, #F472B6 0%, #ec4899 49%, #BE185D 100%)',
}

// Mock data for demonstration
const MOCK_TOKENS: TokenResult[] = [
  {
    address: 'CBvno2t3bFRHpV3YoyuhA2eLaQ42WwUDE4a7d3C1xkSm',
    name: 'hello world',
    ticker: 'HELLO',
    platform: 'pump',
    age: '24m',
    marketCap: '$4K',
    volume: '$3K',
    liquidity: '$8K',
    twitterUrl: 'https://twitter.com',
    tweetType: 'tweet' as TweetType,
    websiteUrl: 'https://example.com',
    axiomUrl: 'https://axiom.trade/t/CBvno2t3bFRHpV3YoyuhA2eLaQ42WwUDE4a7d3C1xkSm',
    creatorWallet: '43HPNeS2FroDxUGRQKV1iNDrYFD1wo5rPVj5Qc9igLZN',
    isOwned: true,
    tokenSecurity: {
      top10HoldersPercent: 32,
      devHoldersPercent: 5,
      snipersHoldersPercent: 8,
      insidersPercent: 12,
      bundlersPercent: 3,
      lpBurnedPercent: 100,
      holdersCount: 1240,
      proTradersCount: 18,
      dexPaid: true,
    },
    creator: { name: 'SolDev', walletAddress: '43HPNeS2FroDxUGRQKV1iNDrYFD1wo5rPVj5Qc9igLZN' },
    sourceTweet: {
      id: 'mock-tweet-1',
      type: 'mention',
      author: { name: 'CryptoAlpha', handle: 'cryptoalpha', followers: 52000 },
      content: 'Just launched $HELLO on Pump.fun! Community token for the culture. LFG!',
      timestamp: new Date(Date.now() - 24 * 60 * 1000),
      tweetUrl: 'https://twitter.com/cryptoalpha/status/123',
    },
    progressPercent: 67,
    buyVolumeUsd: 2100,
    sellVolumeUsd: 900,
    platformFee: '1.5%',
  },
  {
    address: '7dNW2mhCtqoZcDuyRbj5LMoeFsS9TpaCdSkk4qMstGPm',
    name: 'Hello Kitty',
    ticker: 'KITTY',
    platform: 'mayhem',
    age: '3mo',
    marketCap: '$146K',
    volume: '$142',
    liquidity: '$61K',
    twitterUrl: 'https://twitter.com',
    tweetType: 'quote' as TweetType,
    axiomUrl: 'https://axiom.trade/t/7dNW2mhCtqoZcDuyRbj5LMoeFsS9TpaCdSkk4qMstGPm',
    creatorWallet: 'DifferentWallet123456789012345678901234567890',
    tokenSecurity: {
      top10HoldersPercent: 45,
      devHoldersPercent: 0,
      snipersHoldersPercent: 15,
      insidersPercent: 22,
      bundlersPercent: 9,
      lpBurnedPercent: 80,
      holdersCount: 3500,
      proTradersCount: 42,
      dexPaid: false,
    },
    creator: { name: 'MayhemKing', walletAddress: 'DifferentWallet123456789012345678901234567890' },
    progressPercent: 100,
    buyVolumeUsd: 95000,
    sellVolumeUsd: 47000,
    platformFee: '1%',
  },
  {
    address: 'HsRtbRWaB29bPg6wESHz61y6VYbZvJJzoreGuqTupfM9',
    name: 'Hello Kitty',
    ticker: 'KITTY',
    platform: 'bonk',
    age: '8mo',
    marketCap: '$65K',
    volume: '$128',
    liquidity: '$50K',
    websiteUrl: 'https://example.com',
    axiomUrl: 'https://axiom.trade/t/HsRtbRWaB29bPg6wESHz61y6VYbZvJJzoreGuqTupfM9',
    creatorWallet: '43HPNeS2FroDxUGRQKV1iNDrYFD1wo5rPVj5Qc9igLZN',
    isOwned: true,
    tokenSecurity: {
      top10HoldersPercent: 28,
      devHoldersPercent: 2,
      snipersHoldersPercent: 5,
      insidersPercent: 8,
      bundlersPercent: 1,
      lpBurnedPercent: 100,
      holdersCount: 5200,
      proTradersCount: 65,
      dexPaid: true,
    },
    creator: { name: 'BonkMaster', walletAddress: '43HPNeS2FroDxUGRQKV1iNDrYFD1wo5rPVj5Qc9igLZN' },
    progressPercent: 100,
    buyVolumeUsd: 40000,
    sellVolumeUsd: 25000,
    platformFee: '1%',
  },
  {
    address: 'FourMeme123456789012345678901234567890ABCD',
    name: 'Four Meme Token',
    ticker: 'FOUR',
    platform: 'fourmeme',
    age: '2d',
    marketCap: '$12K',
    volume: '$5K',
    liquidity: '$15K',
    creatorWallet: 'AnotherWallet12345678901234567890123456789012',
    creator: { name: '4MemeDeployer', walletAddress: 'AnotherWallet12345678901234567890123456789012' },
    progressPercent: 23,
    buyVolumeUsd: 3500,
    sellVolumeUsd: 1500,
    platformFee: '1%',
  },
  {
    address: 'BagsToken123456789012345678901234567890EFGH',
    name: 'Bags Meme',
    ticker: 'BAGS',
    platform: 'bags',
    age: '1w',
    marketCap: '$85K',
    volume: '$2K',
    liquidity: '$40K',
    creatorWallet: 'BagsCreator12345678901234567890123456789012345',
    creator: { name: 'BagsOG', rewardsPercent: 5, walletAddress: 'BagsCreator12345678901234567890123456789012345' },
    progressPercent: 88,
    buyVolumeUsd: 55000,
    sellVolumeUsd: 30000,
    platformFee: '1%',
    recipients: [
      { name: 'Creator', percent: 60, walletAddress: 'BagsCreator12345678901234567890123456789012345', earnedSol: 4.2 },
      { name: 'Referrer', percent: 40, walletAddress: 'RefWallet12345678901234567890123456789012345678', earnedSol: 2.8 },
    ],
  },
]

// ============================================================================
// Tweet Search Types & Data
// ============================================================================

interface TweetSearchResult {
  post: SocialPostData
  relatedTicker: string
  relatedCA: string
}

function isContractAddress(q: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q.trim())
}

const MOCK_TWEETS: TweetSearchResult[] = [
  {
    relatedTicker: 'HELLO',
    relatedCA: 'CBvno2t3bFRHpV3YoyuhA2eLaQ42WwUDE4a7d3C1xkSm',
    post: {
      id: 'tweet-1',
      type: 'mention',
      tweetType: 'post',
      author: {
        name: 'CryptoWhale',
        handle: 'cryptowhale',
        followers: 125000,
      },
      content: '$HELLO just launched on Pump.fun and already at $4K MC. This could be an easy 100x. Dev is based and locked liquidity. NFA 🚀',
      timestamp: new Date(Date.now() - 1000 * 60 * 12),
      tweetUrl: 'https://x.com/cryptowhale/status/1234567890',
    },
  },
  {
    relatedTicker: 'HELLO',
    relatedCA: 'CBvno2t3bFRHpV3YoyuhA2eLaQ42WwUDE4a7d3C1xkSm',
    post: {
      id: 'tweet-2',
      type: 'alert',
      tweetType: 'reply',
      author: {
        name: 'SolanaAlpha',
        handle: 'solalpha',
        followers: 48000,
      },
      content: 'Grabbed a bag of $HELLO early. Chart looks clean, no rugs in dev history. DYOR but I\'m bullish.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      tweetUrl: 'https://x.com/solalpha/status/1234567891',
      replyTo: {
        author: { name: 'CryptoWhale', handle: 'cryptowhale' },
        content: '$HELLO just launched on Pump.fun and already at $4K MC.',
      },
    },
  },
  {
    relatedTicker: 'KITTY',
    relatedCA: '7dNW2mhCtqoZcDuyRbj5LMoeFsS9TpaCdSkk4qMstGPm',
    post: {
      id: 'tweet-3',
      type: 'mention',
      tweetType: 'quote',
      author: {
        name: 'MemeKing',
        handle: 'memeking_sol',
        followers: 200000,
      },
      content: '$KITTY on Mayhem is pumping hard. Hello Kitty meta is back?? 🐱',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      tweetUrl: 'https://x.com/memeking_sol/status/1234567892',
      quotedTweet: {
        author: { name: 'MayhemLaunches', handle: 'mayhem_launches' },
        content: 'New token alert: Hello Kitty ($KITTY) just launched! Already trending on Mayhem.',
      },
    },
  },
  {
    relatedTicker: 'FOUR',
    relatedCA: 'FourMeme123456789012345678901234567890ABCD',
    post: {
      id: 'tweet-4',
      type: 'trade',
      tweetType: 'post',
      author: {
        name: 'DeFi Degen',
        handle: 'defidegen',
        followers: 75000,
      },
      content: 'Aping into $FOUR on four.meme. New platform, early opportunity. MC only $12K with solid volume. Let\'s ride 🏄',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      tweetUrl: 'https://x.com/defidegen/status/1234567893',
      tradeInfo: { action: 'buy', amount: 2.5, price: 0.00012 },
    },
  },
  {
    relatedTicker: 'BAGS',
    relatedCA: 'BagsToken123456789012345678901234567890EFGH',
    post: {
      id: 'tweet-5',
      type: 'mention',
      tweetType: 'post',
      author: {
        name: 'Bags Official',
        handle: 'bags_fm',
        followers: 15000,
      },
      content: '$BAGS is the native meme of the Bags platform. Community-driven, fair launch, no presale. Join the movement! bags.fm',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      tweetUrl: 'https://x.com/bags_fm/status/1234567894',
      linkPreview: {
        url: 'https://bags.fm',
        title: 'Bags - Fair Launch Platform',
        description: 'The fairest way to launch meme tokens on Solana.',
        siteName: 'Bags',
      },
    },
  },
]

// ============================================================================
// Helper Components
// ============================================================================

function PlatformBadge({ platform }: { platform: PlatformType }) {
  const colorClass = PLATFORM_COLORS[platform]
  const iconSrc = PLATFORM_ICONS[platform]
  const platformName = PLATFORM_NAMES[platform]

  return (
    <Tooltip content={platformName} position="top" delayShow={200}>
      <div
        className={`absolute -bottom-0.5 -right-0.5 sm:bottom-0 sm:right-0 h-[14px] w-[14px] sm:h-4 sm:w-4 rounded-full bg-kol-bg shadow-sm z-30 flex items-center justify-center border ${colorClass}`}
      >
        <img src={iconSrc} alt={platformName} className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
      </div>
    </Tooltip>
  )
}

function TokenAvatar({ token }: { token: TokenResult }) {
  return (
    <div className="relative h-[48px] w-[48px] sm:h-[66px] sm:w-[66px] flex-shrink-0">
      {/* Gradient ring - base layer */}
      <div
        className="absolute inset-0 z-10 rounded-[4px]"
        style={{ background: PLATFORM_RING_GRADIENTS[token.platform] }}
      />
      {/* Image container - on top */}
      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[4px] p-[1px]">
        <div className="h-full w-full rounded-[3px] bg-kol-surface overflow-hidden">
          {token.image ? (
            <img
              src={token.image}
              alt={token.name}
              className="h-full w-full rounded-[1px] object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-[1px] flex items-center justify-center text-sm sm:text-base font-bold text-kol-text-muted">
              {token.ticker.slice(0, 2)}
            </div>
          )}
        </div>
      </div>
      <PlatformBadge platform={token.platform} />
    </div>
  )
}

function TokenRow({
  token,
  isSelected,
  isOwned,
  onManage,
  onClone,
  onClick,
  onDoubleClick,
  solPrice
}: {
  token: TokenResult
  isSelected?: boolean
  isOwned?: boolean
  onManage?: (token: TokenResult) => void
  onClone?: (token: TokenResult) => void
  onClick: () => void
  onDoubleClick?: () => void
  solPrice?: number
}) {
  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(token.address)
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`
        flex items-center gap-3 px-4 h-16 sm:h-[88px] cursor-pointer transition-colors
        ${isSelected ? 'bg-kol-surface-elevated' : 'hover:bg-white/[7%]'}
      `}
    >
      <TokenAvatar token={token} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-base font-medium text-white truncate max-w-[80px] sm:max-w-none tracking-[-0.02em]">
            {token.ticker}
          </span>
          <Tooltip content={token.name} position="top" delayShow={200}>
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 text-xs sm:text-base text-kol-text-muted hover:text-kol-blue transition-colors"
            >
              <span className="truncate max-w-[48px] sm:max-w-[150px] font-medium tracking-[-0.02em]">{token.name}</span>
              <i className="ri-file-copy-line text-xs sm:text-sm" />
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs sm:text-sm font-medium text-kol-green">{token.age}</span>

          {/* Tweet type link with popover */}
          {token.twitterUrl && (
            <QuickLinkPopover
              width={token.sourceTweet ? 356 : 220}
              triggerMode="hover"
              content={
                <SourceTweetPopoverContent
                  sourceTweet={token.sourceTweet}
                  twitterUrl={token.twitterUrl}
                  tweetLabel={getTweetTypeLabel(token.tweetType)}
                />
              }
            >
              <a
                href={token.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center transition-colors hover:opacity-80"
                style={{ color: getTweetTypeColor(token.tweetType) }}
              >
                <i className={`${getTweetTypeIcon(token.tweetType)} text-xs sm:text-base`} />
              </a>
            </QuickLinkPopover>
          )}

          {/* Website link with popover */}
          {token.websiteUrl && (
            <QuickLinkPopover
              width={220}
              triggerMode="hover"
              content={
                <div className="p-3">
                  <a
                    href={token.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-kol-blue hover:text-kol-blue-hover transition-colors"
                  >
                    <i className="ri-external-link-line text-base" />
                    <span className="truncate">{token.websiteUrl.replace(/^https?:\/\//, '')}</span>
                  </a>
                </div>
              }
            >
              <a
                href={token.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center text-kol-text-muted hover:text-white transition-colors"
              >
                <i className="ri-global-line text-xs sm:text-base" />
              </a>
            </QuickLinkPopover>
          )}

          {/* Platform logo link with popover */}
          <QuickLinkPopover
            width={280}
            triggerMode="hover"
            content={
              <PlatformCreatorPopoverContent
                platformName={PLATFORM_NAMES[token.platform]}
                platformLogo={PLATFORM_ICONS[token.platform]}
                platformColor={PLATFORM_RING_COLORS[token.platform]}
                platformFee={token.platformFee}
                creator={token.creator}
                progressPercent={token.progressPercent}
                totalVolumeUsd={token.buyVolumeUsd !== undefined && token.sellVolumeUsd !== undefined ? token.buyVolumeUsd + token.sellVolumeUsd : undefined}
                solPrice={solPrice}
                platformUrl={PLATFORM_URL_PATTERNS[token.platform].replace('{address}', token.address)}
                platformType={token.platform}
                recipients={token.recipients}
              />
            }
          >
            <a
              href={PLATFORM_URL_PATTERNS[token.platform].replace('{address}', token.address)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img src={PLATFORM_ICONS[token.platform]} alt={PLATFORM_NAMES[token.platform]} className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
            </a>
          </QuickLinkPopover>

          {/* Axiom link with popover */}
          {token.axiomUrl && (
            <QuickLinkPopover
              width={token.tokenSecurity ? 320 : 220}
              triggerMode="hover"
              content={
                token.tokenSecurity ? (
                  <TokenInfoPopoverContent
                    security={token.tokenSecurity}
                    axiomUrl={token.axiomUrl}
                  />
                ) : (
                  <div className="p-3">
                    <a
                      href={token.axiomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-white hover:text-kol-blue-hover transition-colors"
                    >
                      <AxiomIcon className="w-4 h-4" />
                      <span>Trade on Axiom</span>
                      <i className="ri-external-link-line text-[11px]" />
                    </a>
                  </div>
                )
              }
            >
              <a
                href={token.axiomUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center text-white hover:opacity-80 transition-opacity"
              >
                <AxiomIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </QuickLinkPopover>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-end gap-1">
          <span className="text-[10px] sm:text-xs text-kol-text-muted pb-[1.6px]">MC</span>
          <span className="text-xs sm:text-base text-white font-medium">{token.marketCap}</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-[10px] sm:text-xs text-kol-text-muted pb-[1.6px]">V</span>
          <span className="text-xs sm:text-base text-white font-medium">{token.volume}</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-[10px] sm:text-xs text-kol-text-muted pb-[1.6px]">L</span>
          <span className="text-xs sm:text-base text-white font-medium">{token.liquidity}</span>
        </div>
      </div>

      {isOwned ? (
        <Tooltip content="Manage token" position="bottom" delayShow={200}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onManage?.(token)
            }}
            className="hidden sm:flex h-[30px] w-[30px] items-center justify-center rounded-full bg-kol-blue hover:bg-kol-blue-hover transition-colors"
          >
            <i className="ri-settings-3-line text-base text-black" />
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Clone token" position="bottom" delayShow={200}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClone?.(token)
            }}
            className="hidden sm:flex h-[30px] w-[30px] items-center justify-center rounded-full bg-kol-surface-elevated hover:bg-white/[12%] border border-kol-border transition-colors"
          >
            <i className="ri-file-copy-line text-base text-kol-text-muted" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function SearchTokensModal({
  isOpen,
  onClose,
  onSelectToken,
  onManageToken,
  onCloneToken,
  initialQuery,
  solPrice,
}: SearchTokensModalProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('time')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [walletFilterOpen, setWalletFilterOpen] = useState(false)
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const walletFilterRef = useRef<HTMLSpanElement>(null)

  // Load wallets from storage on modal open
  useEffect(() => {
    if (isOpen) {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          chrome.storage.local.get(WALLET_FILTER_STORAGE_KEY, (result) => {
            const stored = result[WALLET_FILTER_STORAGE_KEY]
            if (Array.isArray(stored)) {
              setSavedWallets(stored)
            }
          })
        } else {
          const stored = localStorage.getItem(WALLET_FILTER_STORAGE_KEY)
          if (stored) setSavedWallets(JSON.parse(stored))
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [isOpen])

  // Persist wallets to storage
  const persistWallets = useCallback((wallets: SavedWallet[]) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ [WALLET_FILTER_STORAGE_KEY]: wallets })
      } else {
        localStorage.setItem(WALLET_FILTER_STORAGE_KEY, JSON.stringify(wallets))
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const handleAddWallet = useCallback((address: string) => {
    setSavedWallets((prev) => {
      const next = [...prev, { id: crypto.randomUUID(), address, mode: 'include' as const, enabled: true }]
      persistWallets(next)
      return next
    })
  }, [persistWallets])

  const handleRemoveWallet = useCallback((id: string) => {
    setSavedWallets((prev) => {
      const next = prev.filter((w) => w.id !== id)
      persistWallets(next)
      return next
    })
  }, [persistWallets])

  const handleToggleMode = useCallback((id: string) => {
    setSavedWallets((prev) => {
      const next = prev.map((w) =>
        w.id === id ? { ...w, mode: w.mode === 'include' ? 'exclude' as const : 'include' as const } : w
      )
      persistWallets(next)
      return next
    })
  }, [persistWallets])

  const handleToggleEnabled = useCallback((id: string) => {
    setSavedWallets((prev) => {
      const next = prev.map((w) => w.id === id ? { ...w, enabled: !w.enabled } : w)
      persistWallets(next)
      return next
    })
  }, [persistWallets])

  const handleSetNickname = useCallback((id: string, nickname: string) => {
    setSavedWallets((prev) => {
      const next = prev.map((w) => w.id === id ? { ...w, nickname: nickname || undefined } : w)
      persistWallets(next)
      return next
    })
  }, [persistWallets])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Pre-fill search query from initialQuery when modal opens
  useEffect(() => {
    if (isOpen && initialQuery) {
      setSearchQuery(initialQuery)
    }
  }, [isOpen, initialQuery])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSelectedIndex(0)
      setWalletFilterOpen(false)
    }
  }, [isOpen])

  // Filter tokens based on search, platform, and wallet filter
  const queryIsCA = isContractAddress(searchQuery.trim())
  const filteredTokens = MOCK_TOKENS.filter((token) => {
    const matchesSearch = searchQuery === ''
      ? true
      : queryIsCA
        ? token.address === searchQuery.trim()
        : token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatform =
      platformFilter === 'all' || token.platform === platformFilter

    // Wallet filter — only consider enabled wallets
    let matchesWallet = true
    const activeWallets = savedWallets.filter((w) => w.enabled)
    if (activeWallets.length > 0 && token.creatorWallet) {
      const includeWallets = activeWallets.filter((w) => w.mode === 'include')
      const excludeWallets = activeWallets.filter((w) => w.mode === 'exclude')

      if (includeWallets.length > 0) {
        matchesWallet = includeWallets.some((w) => w.address === token.creatorWallet)
      }
      if (matchesWallet && excludeWallets.length > 0) {
        matchesWallet = !excludeWallets.some((w) => w.address === token.creatorWallet)
      }
    }

    return matchesSearch && matchesPlatform && matchesWallet
  })

  // Filter tweets based on search query
  const filteredTweets = MOCK_TWEETS.filter((tweet) => {
    if (searchQuery === '') return false
    const q = searchQuery.trim()
    if (isContractAddress(q)) {
      return tweet.relatedCA === q
    }
    const lower = q.replace(/^\$/, '').toLowerCase()
    return (
      tweet.relatedTicker.toLowerCase().includes(lower) ||
      tweet.post.content.toLowerCase().includes(lower) ||
      tweet.post.author.handle.toLowerCase().includes(lower)
    )
  })

  // Detect query type for badge
  const queryType = searchQuery.trim()
    ? isContractAddress(searchQuery.trim())
      ? 'CA'
      : 'Ticker'
    : null

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredTokens.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && filteredTokens[selectedIndex]) {
        setSearchQuery(filteredTokens[selectedIndex].address)
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredTokens, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9998] flex items-start sm:items-center justify-center pt-6 sm:pt-0 px-4 sm:px-0 bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: CUSTOM_EASE }}
            className="w-full sm:w-[640px] max-h-[calc(100vh-48px)] sm:max-h-[600px] h-[480px] sm:h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-kol-bg rounded-lg overflow-hidden border border-kol-border shadow-[0_4px_4px_0_rgba(0,0,0,0.30),0_8px_8px_0_rgba(0,0,0,0.45)] flex flex-col h-full">
              {/* Filters Row - Platform filters left, Sort icons right */}
              <div className="flex items-center justify-between gap-4 px-4 pl-3 pt-3">
                {/* Platform Filters - scrollable */}
                <HorizontalScrollContainer className="flex items-center gap-2 overflow-x-auto scrollbar-hide -ml-2 pl-2 pr-0" gradientFrom="from-kol-bg">
                  {PLATFORM_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setPlatformFilter(filter.id)}
                      className={`
                        flex h-6 flex-shrink-0 items-center gap-[3px] px-1 rounded text-xs font-medium whitespace-nowrap transition-colors border
                        ${platformFilter === filter.id
                          ? 'bg-kol-blue/15 text-kol-blue border-kol-blue/50'
                          : 'bg-kol-surface/45 border-kol-border text-kol-text-muted hover:bg-kol-surface-elevated'
                        }
                      `}
                    >
                      {filter.icon && <img src={filter.icon} alt={filter.label} className="w-3 h-3" />}
                      <span className="font-medium">{filter.label}</span>
                    </button>
                  ))}
                </HorizontalScrollContainer>

                {/* Sort Icons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-kol-text-muted">Sort by</span>
                  {SORT_OPTIONS.map((option) => (
                    <Tooltip key={option.id} content={option.label} position="bottom" delayShow={200}>
                      <button
                        onClick={() => setSortBy(option.id)}
                        className={`
                          h-6 w-6 flex items-center justify-center rounded transition-colors
                          ${sortBy === option.id
                            ? 'bg-kol-blue/15 text-kol-blue'
                            : 'text-kol-text-muted hover:bg-kol-surface-elevated'
                          }
                        `}
                      >
                        <i className={`${option.icon} text-sm`} />
                      </button>
                    </Tooltip>
                  ))}

                  {/* Wallet Filter Button */}
                  <span ref={walletFilterRef}>
                    <Tooltip content="Filter by Wallet" position="bottom" delayShow={200}>
                      <button
                        onClick={() => setWalletFilterOpen((prev) => !prev)}
                        className={`
                          relative h-6 w-6 flex items-center justify-center rounded transition-colors
                          ${savedWallets.length > 0
                            ? 'bg-kol-blue/15 text-kol-blue'
                            : 'text-kol-text-muted hover:bg-kol-surface-elevated'
                          }
                        `}
                      >
                        <i className="ri-wallet-3-line text-sm" />
                        {savedWallets.length > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-kol-blue" />
                        )}
                      </button>
                    </Tooltip>
                  </span>
                </div>
              </div>

              {/* Search Input */}
              <div className="flex h-16 items-center gap-2 px-4 border-b border-kol-border/50">
                <i className="ri-search-line text-xl text-kol-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ticker, or CA..."
                  className="flex-1 bg-transparent text-xl text-white placeholder:text-xl placeholder:text-kol-text-muted outline-none"
                />
                {queryType && (
                  <span className="flex-shrink-0 h-5 px-2 rounded bg-kol-surface-elevated border border-kol-border/50 text-[10px] font-medium text-kol-text-muted flex items-center">
                    {queryType}
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="flex h-5 items-center px-2 rounded-full border border-kol-border bg-kol-surface text-xs text-white hover:bg-kol-surface-elevated transition-colors"
                >
                  Esc
                </button>
              </div>

              {/* Results Header */}
              <div className="flex h-10 items-center justify-between px-4 pr-2">
                <span className="text-xs text-kol-text-secondary">
                  {filteredTokens.length > 0 ? `${filteredTokens.length} Results` : 'History'}
                </span>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto">
                {filteredTokens.length > 0 ? (
                  <>
                    {filteredTokens.map((token, index) => (
                      <TokenRow
                        key={token.address}
                        token={token}
                        isSelected={index === selectedIndex}
                        isOwned={token.isOwned}
                        onManage={onManageToken}
                        onClone={onCloneToken}
                        solPrice={solPrice}
                        onClick={() => {
                          setSearchQuery(token.address)
                          inputRef.current?.focus()
                        }}
                        onDoubleClick={() => {
                          onSelectToken(token)
                          onClose()
                        }}
                      />
                    ))}

                    {/* Related Tweets Section (shown when searching) */}
                    {searchQuery.trim() && filteredTweets.length > 0 && (
                      <>
                        <div className="flex h-8 items-center px-4 mt-2 border-t border-kol-border/30">
                          <span className="text-xs text-kol-text-muted flex items-center gap-1.5">
                            <i className="ri-twitter-x-line text-sm" />
                            {filteredTweets.length} Related Tweets
                          </span>
                        </div>
                        <div className="px-2 pb-2 space-y-1">
                          {filteredTweets.map((tweet, index) => (
                            <SocialPost
                              key={tweet.post.id}
                              post={tweet.post}
                              index={index}
                              flat={false}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : searchQuery.trim() && filteredTweets.length > 0 ? (
                  <>
                    <div className="flex flex-col items-center justify-center py-6 text-kol-text-muted">
                      <i className="ri-search-line text-2xl mb-1 opacity-50" />
                      <p className="text-xs">No tokens found</p>
                    </div>
                    <div className="flex h-8 items-center px-4 border-t border-kol-border/30">
                      <span className="text-xs text-kol-text-muted flex items-center gap-1.5">
                        <i className="ri-twitter-x-line text-sm" />
                        {filteredTweets.length} Related Tweets
                      </span>
                    </div>
                    <div className="px-2 pb-2 space-y-1">
                      {filteredTweets.map((tweet, index) => (
                        <SocialPost
                          key={tweet.post.id}
                          post={tweet.post}
                          index={index}
                          flat={false}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-kol-text-muted">
                    <i className="ri-search-line text-3xl mb-2 opacity-50" />
                    <p className="text-sm">No tokens found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {createPortal(modalContent, document.body)}
      <WalletFilterDropdown
        isOpen={walletFilterOpen}
        onClose={() => setWalletFilterOpen(false)}
        triggerRef={walletFilterRef}
        wallets={savedWallets}
        onAddWallet={handleAddWallet}
        onRemoveWallet={handleRemoveWallet}
        onToggleMode={handleToggleMode}
        onToggleEnabled={handleToggleEnabled}
        onSetNickname={handleSetNickname}
      />
    </>
  )
}

export default SearchTokensModal
