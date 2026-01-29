import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CoinCard, CoinData } from './CoinCard'
import { ExpandableFilterPill } from '../ui/ExpandableFilterPill'
import { HorizontalScrollContainer } from '../ui/HorizontalScrollContainer'
import { SearchTokensModal } from '../ui/SearchTokensModal'

type PlatformType = 'pump' | 'bonk' | 'bags' | 'mayhem' | 'fourmeme'
type PlatformFilter = 'all' | PlatformType
type SortOption = 'time' | 'trending' | 'volume' | 'liquidity'

const PLATFORM_FILTERS: { id: PlatformFilter; label: string; icon?: string; riIcon?: string }[] = [
  { id: 'all', label: 'All', riIcon: 'ri-list-check' },
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

// Mock data with new fields - showcasing all tweet types
const MOCK_COINS: CoinData[] = [
  {
    id: '1',
    name: 'DogWifHat',
    symbol: 'WIF',
    image: 'https://pbs.twimg.com/profile_images/1742059584087289856/viSxBP1h_400x400.jpg',
    address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    holdings: 2.45,
    holdingsUsd: 245.50,
    pnl: 0.89,
    pnlPercent: 57.2,
    marketCap: 156000,
    launchedAt: new Date(Date.now() - 3600000 * 24),
    platform: 'pump',
    twitterUrl: 'https://x.com/dogwifcoin/status/1234567890',
    tweetType: 'tweet',
    axiomUrl: 'https://axiom.trade/t/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    progressPercent: 85,
    tradingStats: {
      boughtAmount: 1.5,
      soldAmount: 0.6,
    },
    buyTxns: 335,
    sellTxns: 199,
    buyVolumeUsd: 4200,
    sellVolumeUsd: 2100,
    sourceTweet: {
      id: 'tweet-1',
      type: 'mention',
      author: {
        name: 'DogWifHat',
        handle: 'dogwifcoin',
        avatar: 'https://pbs.twimg.com/profile_images/1742059584087289856/viSxBP1h_400x400.jpg',
        followers: 125000,
      },
      content: 'Just launched $WIF on Pump.fun! The hat stays on. LFG!',
      timestamp: new Date(Date.now() - 3600000 * 24),
      tweetUrl: 'https://x.com/dogwifcoin/status/1234567890',
    },
    creator: {
      name: 'dogwifcoin',
      avatar: 'https://pbs.twimg.com/profile_images/1742059584087289856/viSxBP1h_400x400.jpg',
      rewardsPercent: 5,
      walletAddress: '43HPNeS2FroDxUGRQKV1iNDrYFD1wo5rPVj5Qc9igLZN',
    },
    tokenSecurity: {
      top10HoldersPercent: 35,
      devHoldersPercent: 8,
      snipersHoldersPercent: 12,
      insidersPercent: 5,
      bundlersPercent: 3,
      lpBurnedPercent: 100,
      holdersCount: 2450,
      proTradersCount: 18,
      dexPaid: true,
    },
  },
  {
    id: '2',
    name: 'Bonk',
    symbol: 'BONK',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    holdings: 0.85,
    holdingsUsd: 85.00,
    pnl: -0.12,
    pnlPercent: -12.8,
    marketCap: 89000,
    launchedAt: new Date(Date.now() - 3600000 * 2),
    platform: 'bonk',
    twitterUrl: 'https://x.com/bonk_inu/status/111111111',
    tweetType: 'reply',
    axiomUrl: 'https://axiom.trade/t/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    progressPercent: 42,
    tradingStats: {
      boughtAmount: 0.97,
      soldAmount: 0,
    },
    buyTxns: 128,
    sellTxns: 45,
    buyVolumeUsd: 1850,
    sellVolumeUsd: 620,
    sourceTweet: {
      id: 'tweet-2',
      type: 'trade',
      tweetType: 'reply',
      author: {
        name: 'Bonk Inu',
        handle: 'bonk_inu',
        avatar: 'https://pbs.twimg.com/profile_images/1610000000000000000/bonk_400x400.jpg',
        followers: 89000,
      },
      content: '@solana_devs The community has spoken! $BONK is here to stay. Airdrop round 2 coming soon, stay tuned frens.',
      timestamp: new Date(Date.now() - 3600000 * 2),
      tweetUrl: 'https://x.com/bonk_inu/status/111111111',
      replyTo: {
        author: {
          name: 'Solana Devs',
          handle: 'solana_devs',
          avatar: 'https://pbs.twimg.com/profile_images/1500000000000000000/soldev_400x400.jpg',
          followers: 450000,
        },
        content: 'What meme coins are you most bullish on this cycle?',
        timestamp: new Date(Date.now() - 3600000 * 3),
        tweetUrl: 'https://x.com/solana_devs/status/111111110',
      },
    },
    creator: {
      name: 'bonk_dev',
      rewardsPercent: 3,
      walletAddress: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    },
    tokenSecurity: {
      top10HoldersPercent: 52,
      devHoldersPercent: 15,
      snipersHoldersPercent: 20,
      insidersPercent: 10,
      bundlersPercent: 8,
      lpBurnedPercent: 0,
      holdersCount: 890,
      proTradersCount: 5,
      dexPaid: false,
    },
  },
  {
    id: '3',
    name: 'Myro',
    symbol: 'MYRO',
    image: 'https://pbs.twimg.com/profile_images/1755899881783185408/Mtp0uwfM_400x400.jpg',
    address: 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
    holdings: 5.20,
    holdingsUsd: 520.00,
    pnl: 2.34,
    pnlPercent: 82.1,
    marketCap: 445000,
    launchedAt: new Date(Date.now() - 3600000 * 48),
    platform: 'pump',
    twitterUrl: 'https://x.com/myro_sol/status/9876543210',
    tweetType: 'retweet',
    axiomUrl: 'https://axiom.trade/t/HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
    progressPercent: 100,
    tradingStats: {
      boughtAmount: 2.86,
      soldAmount: 0,
    },
    buyTxns: 892,
    sellTxns: 234,
    buyVolumeUsd: 12500,
    sellVolumeUsd: 3400,
    sourceTweet: {
      id: 'tweet-3',
      type: 'alert',
      tweetType: 'repost',
      author: {
        name: 'Myro',
        handle: 'myro_sol',
        avatar: 'https://pbs.twimg.com/profile_images/1755899881783185408/Mtp0uwfM_400x400.jpg',
        followers: 67000,
      },
      content: '',
      timestamp: new Date(Date.now() - 3600000 * 48),
      tweetUrl: 'https://x.com/myro_sol/status/9876543210',
      quotedTweet: {
        author: {
          name: 'Raj Gokal',
          handle: 'rajgokal',
          avatar: 'https://pbs.twimg.com/profile_images/1700000000000000001/raj_400x400.jpg',
          followers: 320000,
        },
        content: 'The Solana meme coin ecosystem is entering a new phase. $MYRO leading the charge with real community engagement.',
        timestamp: new Date(Date.now() - 3600000 * 50),
        tweetUrl: 'https://x.com/rajgokal/status/9876543209',
      },
    },
    creator: {
      name: 'myro_creator',
      avatar: 'https://pbs.twimg.com/profile_images/1755899881783185408/Mtp0uwfM_400x400.jpg',
      rewardsPercent: 4,
      walletAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    },
    tokenSecurity: {
      top10HoldersPercent: 28,
      devHoldersPercent: 5,
      snipersHoldersPercent: 8,
      insidersPercent: 3,
      bundlersPercent: 1,
      lpBurnedPercent: 100,
      holdersCount: 5200,
      proTradersCount: 42,
      dexPaid: true,
    },
  },
  {
    id: '4',
    name: 'Popcat',
    symbol: 'POPCAT',
    image: 'https://pbs.twimg.com/profile_images/1800000000000000000/example_400x400.jpg',
    address: 'PopcatABC123XYZ789DEF456GHI012JKL345MNO678',
    holdings: 1.20,
    holdingsUsd: 120.00,
    pnl: 0.45,
    pnlPercent: 37.5,
    marketCap: 230000,
    launchedAt: new Date(Date.now() - 3600000 * 5),
    platform: 'bags',
    twitterUrl: 'https://x.com/popcat/status/222222222',
    tweetType: 'quote',
    axiomUrl: 'https://axiom.trade/t/PopcatABC123XYZ789DEF456GHI012JKL345MNO678',
    progressPercent: 67,
    tradingStats: {
      boughtAmount: 1.2,
      soldAmount: 0.75,
    },
    buyTxns: 456,
    sellTxns: 312,
    buyVolumeUsd: 5600,
    sellVolumeUsd: 3900,
    sourceTweet: {
      id: 'tweet-4',
      type: 'mention',
      tweetType: 'quote',
      author: {
        name: 'Popcat',
        handle: 'popcat',
        avatar: 'https://pbs.twimg.com/profile_images/1800000000000000000/example_400x400.jpg',
        followers: 42000,
      },
      content: 'Pop pop pop! The cat that pops is now on Solana. $POPCAT to the moon!',
      timestamp: new Date(Date.now() - 3600000 * 5),
      tweetUrl: 'https://x.com/popcat/status/222222222',
      quotedTweet: {
        author: {
          name: 'Crypto Alpha',
          handle: 'crypto_alpha',
          avatar: 'https://pbs.twimg.com/profile_images/1750000000000000000/alpha_400x400.jpg',
          followers: 185000,
        },
        content: 'Thread: Top 5 meme coins launching this week on Solana. Which ones are you watching? 1/ $POPCAT - The internet famous popping cat is now a token.',
        timestamp: new Date(Date.now() - 3600000 * 6),
        tweetUrl: 'https://x.com/crypto_alpha/status/222222220',
      },
    },
    creator: {
      name: 'popcatdev',
      avatar: 'https://pbs.twimg.com/profile_images/1800000000000000000/example_400x400.jpg',
      rewardsPercent: 2.5,
      walletAddress: '5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC',
    },
    tokenSecurity: {
      top10HoldersPercent: 40,
      devHoldersPercent: 10,
      snipersHoldersPercent: 15,
      insidersPercent: 7,
      bundlersPercent: 4,
      lpBurnedPercent: 85,
      holdersCount: 1800,
      proTradersCount: 12,
      dexPaid: true,
    },
  },
  {
    id: '5',
    name: 'Gigachad',
    symbol: 'GIGA',
    address: 'GigaABC123XYZ789DEF456GHI012JKL345MNO678PQR',
    holdings: 3.80,
    holdingsUsd: 380.00,
    pnl: 1.15,
    pnlPercent: 30.3,
    marketCap: 780000,
    launchedAt: new Date(Date.now() - 3600000 * 12),
    platform: 'mayhem',
    twitterUrl: 'https://x.com/gigachad/status/333333333',
    tweetType: 'pin',
    axiomUrl: 'https://axiom.trade/t/GigaABC123XYZ789DEF456GHI012JKL345MNO678PQR',
    progressPercent: 91,
    tradingStats: {
      boughtAmount: 3.8,
      soldAmount: 2.65,
    },
    buyTxns: 1205,
    sellTxns: 678,
    buyVolumeUsd: 18700,
    sellVolumeUsd: 9200,
    sourceTweet: {
      id: 'tweet-5',
      type: 'alert',
      tweetType: 'post',
      author: {
        name: 'Gigachad',
        handle: 'gigachad',
        avatar: 'https://pbs.twimg.com/profile_images/1780000000000000000/giga_400x400.jpg',
        followers: 250000,
      },
      content: 'PINNED: $GIGA is the ultimate chad token on Solana. No rugs, no jeets, only gigachads. Contract: GigaABC123XYZ789DEF456GHI012JKL345MNO678PQR\n\nLP burned. Dev doxxed. Community owned.',
      timestamp: new Date(Date.now() - 3600000 * 12),
      tweetUrl: 'https://x.com/gigachad/status/333333333',
      media: [
        {
          type: 'image',
          url: 'https://pbs.twimg.com/media/gigachad_banner.jpg',
        },
      ],
    },
    creator: {
      name: 'giga_deployer',
      avatar: 'https://pbs.twimg.com/profile_images/1780000000000000000/giga_400x400.jpg',
      rewardsPercent: 5,
      walletAddress: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    },
    tokenSecurity: {
      top10HoldersPercent: 22,
      devHoldersPercent: 3,
      snipersHoldersPercent: 6,
      insidersPercent: 2,
      bundlersPercent: 0,
      lpBurnedPercent: 100,
      holdersCount: 8900,
      proTradersCount: 65,
      dexPaid: true,
    },
  },
  {
    id: '6',
    name: 'Pepe',
    symbol: 'PEPE',
    image: 'https://pbs.twimg.com/profile_images/1700000000000000000/pepe_400x400.jpg',
    address: 'PepeABC123XYZ789DEF456GHI012JKL345MNO678PQR',
    holdings: 0.50,
    holdingsUsd: 50.00,
    pnl: -0.08,
    pnlPercent: -16.0,
    marketCap: 120000,
    launchedAt: new Date(Date.now() - 3600000 * 1),
    platform: 'fourmeme',
    twitterUrl: 'https://x.com/pepecoin/status/444444444',
    tweetType: 'follow',
    axiomUrl: 'https://axiom.trade/t/PepeABC123XYZ789DEF456GHI012JKL345MNO678PQR',
    progressPercent: 23,
    tradingStats: {
      boughtAmount: 0.5,
      soldAmount: 0,
    },
    buyTxns: 67,
    sellTxns: 23,
    buyVolumeUsd: 980,
    sellVolumeUsd: 340,
    sourceTweet: {
      id: 'tweet-6',
      type: 'mention',
      tweetType: 'post',
      author: {
        name: 'Pepe Sol',
        handle: 'pepecoin',
        avatar: 'https://pbs.twimg.com/profile_images/1700000000000000000/pepe_400x400.jpg',
        followers: 15000,
      },
      content: 'New follower alert! @whale_wallet just followed $PEPE. They have 50K+ SOL in their wallet. Smart money is moving in.',
      timestamp: new Date(Date.now() - 3600000 * 1),
      tweetUrl: 'https://x.com/pepecoin/status/444444444',
    },
    creator: {
      name: 'pepe_launcher',
      rewardsPercent: 1.5,
      walletAddress: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
    },
    tokenSecurity: {
      top10HoldersPercent: 65,
      devHoldersPercent: 25,
      snipersHoldersPercent: 30,
      insidersPercent: 18,
      bundlersPercent: 12,
      lpBurnedPercent: 0,
      holdersCount: 340,
      proTradersCount: 2,
      dexPaid: false,
    },
  },
  {
    id: '7',
    name: 'Shiba',
    symbol: 'SHIB',
    address: 'ShibaABC123XYZ789DEF456GHI012JKL345MNO678PQ',
    holdings: 2.00,
    holdingsUsd: 200.00,
    pnl: -0.35,
    pnlPercent: -17.5,
    marketCap: 95000,
    launchedAt: new Date(Date.now() - 3600000 * 72),
    platform: 'bonk',
    twitterUrl: 'https://x.com/shibacoin/status/555555555',
    tweetType: 'delete',
    axiomUrl: 'https://axiom.trade/t/ShibaABC123XYZ789DEF456GHI012JKL345MNO678PQ',
    progressPercent: 55,
    tradingStats: {
      boughtAmount: 2.0,
      soldAmount: 1.65,
    },
    buyTxns: 234,
    sellTxns: 456,
    buyVolumeUsd: 2900,
    sellVolumeUsd: 5600,
    sourceTweet: {
      id: 'tweet-7',
      type: 'alert',
      tweetType: 'post',
      author: {
        name: 'Shiba Sol',
        handle: 'shibacoin',
        followers: 32000,
      },
      content: '[DELETED] Original tweet was removed by the author. This may indicate a rug pull or change in project direction. Exercise caution.',
      timestamp: new Date(Date.now() - 3600000 * 72),
      tweetUrl: 'https://x.com/shibacoin/status/555555555',
    },
    creator: {
      name: 'shib_dev',
      rewardsPercent: 2,
      walletAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    },
    tokenSecurity: {
      top10HoldersPercent: 58,
      devHoldersPercent: 20,
      snipersHoldersPercent: 25,
      insidersPercent: 14,
      bundlersPercent: 9,
      lpBurnedPercent: 30,
      holdersCount: 620,
      proTradersCount: 3,
      dexPaid: false,
    },
  },
  {
    id: '8',
    name: 'Doge',
    symbol: 'DOGE',
    image: 'https://pbs.twimg.com/profile_images/1600000000000000000/doge_400x400.jpg',
    address: 'DogeABC123XYZ789DEF456GHI012JKL345MNO678PQRS',
    holdings: 4.50,
    holdingsUsd: 450.00,
    pnl: 0.72,
    pnlPercent: 16.0,
    marketCap: 560000,
    launchedAt: new Date(Date.now() - 3600000 * 36),
    platform: 'pump',
    twitterUrl: 'https://x.com/dogecoin/status/666666666',
    tweetType: 'profile',
    axiomUrl: 'https://axiom.trade/t/DogeABC123XYZ789DEF456GHI012JKL345MNO678PQRS',
    progressPercent: 78,
    tradingStats: {
      boughtAmount: 4.5,
      soldAmount: 3.78,
    },
    buyTxns: 567,
    sellTxns: 321,
    buyVolumeUsd: 7800,
    sellVolumeUsd: 4500,
    sourceTweet: {
      id: 'tweet-8',
      type: 'mention',
      tweetType: 'post',
      author: {
        name: 'Doge Sol',
        handle: 'dogecoin',
        avatar: 'https://pbs.twimg.com/profile_images/1600000000000000000/doge_400x400.jpg',
        followers: 520000,
      },
      content: 'Profile updated! New bio: "The OG meme coin on Solana. Much wow, very decentralized." Wallet address added to bio: DogeABC123XYZ789DEF456GHI012JKL345MNO678PQRS',
      timestamp: new Date(Date.now() - 3600000 * 36),
      tweetUrl: 'https://x.com/dogecoin/status/666666666',
      linkPreview: {
        url: 'https://pump.fun/DogeABC123XYZ789DEF456GHI012JKL345MNO678PQRS',
        title: 'Doge Sol on Pump.fun',
        description: 'The OG meme coin now on Solana. Trade $DOGE with zero fees during launch phase.',
        siteName: 'Pump.fun',
      },
    },
    creator: {
      name: 'doge_deployer',
      avatar: 'https://pbs.twimg.com/profile_images/1600000000000000000/doge_400x400.jpg',
      rewardsPercent: 3.5,
      walletAddress: 'AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB',
    },
    tokenSecurity: {
      top10HoldersPercent: 30,
      devHoldersPercent: 6,
      snipersHoldersPercent: 10,
      insidersPercent: 4,
      bundlersPercent: 2,
      lpBurnedPercent: 100,
      holdersCount: 4100,
      proTradersCount: 35,
      dexPaid: true,
    },
  },
]

interface CoinsPanelProps {
  isOpen: boolean
  onClose: () => void
  solPrice?: number
}

// Mobile panel height constants
const DEFAULT_HEIGHT = 300
const MIN_HEIGHT = 0
const MAX_HEIGHT = 500

// Fixed desktop width
const DESKTOP_WIDTH = 530

export function CoinsPanel({ solPrice }: CoinsPanelProps) {
  const [coins] = useState<CoinData[]>(MOCK_COINS)
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT)
  const [isResizing, setIsResizing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [platformFilters, setPlatformFilters] = useState<Set<PlatformFilter>>(new Set(['all']))
  const [sortBy, setSortBy] = useState<SortOption>('time')
  const [showFilters, setShowFilters] = useState(true)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchModalQuery, setSearchModalQuery] = useState('')

  const handleSearchToken = (coin: CoinData) => {
    setSearchModalQuery(coin.address)
    setSearchModalOpen(true)
  }

  const togglePlatformFilter = (id: PlatformFilter) => {
    if (id === 'all') {
      setPlatformFilters(new Set(['all']))
      return
    }
    setPlatformFilters(prev => {
      const next = new Set(prev)
      next.delete('all')
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next.size === 0 ? new Set<PlatformFilter>(['all']) : next
    })
  }

  const filteredCoins = coins.filter(coin => {
    const matchesSearch =
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = platformFilters.has('all') || platformFilters.has(coin.platform)
    return matchesSearch && matchesPlatform
  })

  const handleView = (coin: CoinData) => {
    window.open(`https://pump.fun/${coin.address}`, '_blank')
  }

  const handleDevPanel = (coin: CoinData) => {
    console.log('Dev panel for:', coin.symbol)
  }

  const handleRelaunch = (coin: CoinData) => {
    console.log('Relaunch for:', coin.symbol)
  }

  // Mobile resize (height) - drag from top edge
  const handleMobileResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const startHeight = panelHeight

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const delta = startY - clientY
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + delta))
      setPanelHeight(newHeight)
    }

    const handleEnd = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove)
    document.addEventListener('touchend', handleEnd)
  }, [panelHeight])

  // Prevent text selection while resizing (mobile only)
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'row-resize'
    } else {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    return () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing])

  const renderFilterRow = () => (
    <div className="flex items-center justify-between gap-2">
      {/* Platform filter pills */}
      <HorizontalScrollContainer className="flex items-center gap-1 overflow-x-auto no-scrollbar" gradientFrom="from-kol-surface/50">
        {PLATFORM_FILTERS.map((filter) => (
          <ExpandableFilterPill
            key={filter.id}
            icon={filter.riIcon}
            iconSrc={filter.icon}
            label={filter.label}
            active={platformFilters.has(filter.id)}
            onClick={() => togglePlatformFilter(filter.id)}
          />
        ))}
      </HorizontalScrollContainer>

      {/* Sort options */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {SORT_OPTIONS.map((option) => (
          <ExpandableFilterPill
            key={option.id}
            icon={option.icon}
            label={option.label}
            active={sortBy === option.id}
            onClick={() => setSortBy(option.id)}
          />
        ))}
      </div>
    </div>
  )

  const renderCoinsList = () => (
    <>
      {filteredCoins.length > 0 ? (
        filteredCoins.map((coin, index) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            index={index}
            solPrice={solPrice}
            onView={handleView}
            onDevPanel={handleDevPanel}
            onRelaunch={handleRelaunch}
            onSearchToken={handleSearchToken}
          />
        ))
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center h-full py-12 text-center px-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-kol-surface-elevated/50 backdrop-blur-sm border border-kol-border/40 flex items-center justify-center">
              <i className={`text-3xl text-kol-text-muted ${
                searchQuery ? 'ri-search-line' : 'ri-coin-line'
              }`} />
            </div>
            <div
              className="absolute inset-0 rounded-2xl opacity-50 blur-xl -z-10"
              style={{
                background: 'radial-gradient(circle, rgba(0, 123, 255, 0.15) 0%, transparent 70%)',
              }}
            />
            {!searchQuery && (
              <>
                <motion.div
                  className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-kol-blue/30"
                  animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-kol-green/30"
                  animate={{ y: [0, -3, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
          </div>
          <h3 className="font-body font-semibold text-base text-white mb-1">
            {searchQuery ? 'No results found' : 'No positions yet'}
          </h3>
          <p className="font-body text-sm text-kol-text-muted max-w-[200px] mb-4">
            {searchQuery
              ? `No coins matching "${searchQuery}"`
              : 'Your token holdings will appear here once you make a trade'}
          </p>
          {!searchQuery && (
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-kol-blue/15 border border-kol-blue/30 text-kol-blue text-sm font-medium hover:bg-kol-blue/25 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="ri-search-line text-sm" />
              <span>Find tokens</span>
            </motion.button>
          )}
        </motion.div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar (>=lg) - fixed 500px width */}
      <div
        className="hidden lg:flex lg:flex-col h-full bg-kol-surface/50 backdrop-blur-sm border border-kol-border/70 rounded-xl overflow-hidden relative"
        style={{ width: DESKTOP_WIDTH }}
      >
        {/* Header: filters + search container */}
        <div className="px-3 pt-3 pb-2 border-b border-kol-border/30 space-y-2">
          {/* Platform filters & sort */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {renderFilterRow()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search bar */}
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
                className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-kol-text-muted hover:text-white transition-colors z-10"
              >
                <motion.i
                  className="ri-arrow-down-s-line text-sm"
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
              <i className={`ri-search-line absolute left-8 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 ${
                isSearchFocused ? 'text-kol-blue' : 'text-kol-text-tertiary'
              }`} />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 h-9 pl-14 pr-2 bg-transparent border-0 rounded-xl text-sm text-white placeholder:text-kol-text-tertiary font-body focus:outline-none transition-all duration-300"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-0.5 pr-2">
                {/* Clear search */}
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <i className="ri-close-line text-sm" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="w-px h-4 bg-kol-border/40 mx-1" />

                {/* Action buttons */}
                <button className="h-7 px-2 rounded-lg flex items-center gap-1.5 text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors">
                  <i className="ri-file-copy-line text-sm" />
                  <span className="text-xs font-medium whitespace-nowrap">Clone</span>
                </button>

                <button className="h-7 px-2 rounded-lg flex items-center gap-1.5 text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors">
                  <i className="ri-add-line text-sm" />
                  <span className="text-xs font-medium whitespace-nowrap">Create</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coins List */}
        <div className="flex-1 overflow-y-auto pt-1 scrollbar-styled">
          {renderCoinsList()}
        </div>
      </div>

      {/* Mobile bottom section (<lg) - resizable height */}
      <div className="lg:hidden relative flex flex-col">
        {/* Top resize handle - outside the collapsible area so it stays grabbable */}
        <div
          onMouseDown={handleMobileResizeStart}
          onTouchStart={handleMobileResizeStart}
          className="h-5 cursor-row-resize flex items-center justify-center z-10 flex-shrink-0 border-t border-kol-border/50 bg-kol-surface-elevated/90 backdrop-blur-sm"
        >
          <div className="w-10 h-1 rounded-full bg-kol-text-muted/40 hover:bg-kol-blue/50 transition-colors" />
        </div>
        <div
          className="bg-kol-bg/80 backdrop-blur-sm flex flex-col overflow-hidden"
          style={{ height: panelHeight }}
        >

        {/* Header: filters + search container - larger on mobile for better touch targets */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0 border-b border-kol-border/30 space-y-2">
          {/* Platform filters & sort */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {renderFilterRow()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search bar */}
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
              isSearchFocused ? 'border-kol-blue/50' : 'border-kol-border'
            }`}>
              {/* Chevron toggle for filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-kol-text-muted hover:text-white transition-colors z-10"
              >
                <motion.i
                  className="ri-arrow-down-s-line text-base"
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
              <i className={`ri-search-line absolute left-9 top-1/2 -translate-y-1/2 text-base transition-colors duration-200 ${
                isSearchFocused ? 'text-kol-blue' : 'text-kol-text-tertiary'
              }`} />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 min-w-0 h-11 pl-16 pr-2 bg-transparent border-0 rounded-xl text-base text-white placeholder:text-kol-text-tertiary font-body focus:outline-none transition-all duration-300"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-1 pr-2 flex-shrink-0">
                {/* Clear search */}
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <i className="ri-close-line text-base" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="w-px h-5 bg-kol-border/40 mx-1" />

                {/* Action buttons */}
                <button className="h-9 px-2.5 rounded-lg flex items-center gap-2 text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors">
                  <i className="ri-file-copy-line text-base" />
                  <span className="text-sm font-medium whitespace-nowrap">Clone</span>
                </button>

                <button className="h-9 px-2.5 rounded-lg flex items-center gap-2 text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors">
                  <i className="ri-add-line text-base" />
                  <span className="text-sm font-medium whitespace-nowrap">Create</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coins List - vertical scroll */}
        <div className="flex-1 overflow-y-auto pt-1 scrollbar-styled">
          {renderCoinsList()}
        </div>
        </div>
      </div>

      {/* Search Token Modal */}
      <SearchTokensModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectToken={(token) => {
          console.log('Selected token:', token)
          setSearchModalOpen(false)
        }}
        initialQuery={searchModalQuery}
      />
    </>
  )
}
