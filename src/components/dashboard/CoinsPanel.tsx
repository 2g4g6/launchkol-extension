import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CoinCard, CoinData } from './CoinCard'

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
    platform: 'raydium',
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
  },
]

interface CoinsPanelProps {
  isOpen: boolean
  onClose: () => void
}

// Default sizes
const DEFAULT_WIDTH = 320 // Desktop sidebar width
const MIN_WIDTH = 280
const MAX_WIDTH = 500
const DEFAULT_HEIGHT = 300 // Mobile panel height
const MIN_HEIGHT = 150
const MAX_HEIGHT = 500

export function CoinsPanel({}: CoinsPanelProps) {
  const [coins] = useState<CoinData[]>(MOCK_COINS)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH)
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT)
  const [isResizing, setIsResizing] = useState(false)

  const handleView = (coin: CoinData) => {
    window.open(`https://pump.fun/${coin.address}`, '_blank')
  }

  const handleDevPanel = (coin: CoinData) => {
    console.log('Dev panel for:', coin.symbol)
  }

  const handleRelaunch = (coin: CoinData) => {
    console.log('Relaunch for:', coin.symbol)
  }

  // Desktop resize (width) - drag from left edge
  const handleDesktopResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = panelWidth

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startX - e.clientX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta))
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [panelWidth])

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

  // Prevent text selection while resizing
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    } else {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    return () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing])

  const renderCoinsList = () => (
    <>
      {coins.length > 0 ? (
        coins.map((coin, index) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            index={index}
            onView={handleView}
            onDevPanel={handleDevPanel}
            onRelaunch={handleRelaunch}
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
              <i className="ri-coin-line text-3xl text-kol-text-muted" />
            </div>
            <div
              className="absolute inset-0 rounded-2xl opacity-50 blur-xl -z-10"
              style={{
                background: 'radial-gradient(circle, rgba(0, 123, 255, 0.15) 0%, transparent 70%)',
              }}
            />
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
          </div>
          <h3 className="font-body font-semibold text-base text-white mb-1">
            No positions yet
          </h3>
          <p className="font-body text-sm text-kol-text-muted max-w-[200px] mb-4">
            Your token holdings will appear here once you make a trade
          </p>
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-kol-blue/15 border border-kol-blue/30 text-kol-blue text-sm font-medium hover:bg-kol-blue/25 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className="ri-search-line text-sm" />
            <span>Find tokens</span>
          </motion.button>
        </motion.div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar (>=lg) - resizable width */}
      <div
        className="hidden lg:flex lg:flex-col h-full bg-kol-surface/50 backdrop-blur-sm border border-kol-border/50 rounded-xl overflow-hidden relative"
        style={{ width: panelWidth }}
      >
        {/* Left resize handle */}
        <div
          onMouseDown={handleDesktopResizeStart}
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-kol-blue/30 transition-colors z-10 group"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-kol-border/50 group-hover:bg-kol-blue/50 transition-colors" />
        </div>

        {/* Header */}
        <div className="px-3 pt-3 pb-2 border-b border-kol-border/30">
          <div className="flex items-center justify-between h-9 px-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Your Coins</span>
              <span className="text-[10px] font-mono text-kol-text-tertiary bg-kol-surface/50 px-1.5 py-0.5 rounded">
                {coins.length}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors" title="Filter & Sort">
                <i className="ri-filter-3-line text-sm" />
              </button>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors" title="Refresh">
                <i className="ri-refresh-line text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Coins List */}
        <div className="flex-1 overflow-y-auto pt-1 scrollbar-styled">
          {renderCoinsList()}
        </div>
      </div>

      {/* Mobile bottom section (<lg) - resizable height */}
      <div
        className="lg:hidden border-t border-kol-border/50 bg-kol-bg/80 backdrop-blur-sm relative flex flex-col"
        style={{ height: panelHeight }}
      >
        {/* Top resize handle */}
        <div
          onMouseDown={handleMobileResizeStart}
          onTouchStart={handleMobileResizeStart}
          className="absolute -top-2 left-0 right-0 h-4 cursor-row-resize flex items-center justify-center z-10"
        >
          <div className="w-10 h-1 rounded-full bg-kol-border/50 hover:bg-kol-blue/50 transition-colors" />
        </div>

        {/* Header - matches TrackerFeed search bar height */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0 border-b border-kol-border/30">
          <div className="flex items-center justify-between h-9 px-3">
            <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">Your Coins</span>
              <span className="text-[10px] font-mono text-kol-text-tertiary bg-kol-surface/50 px-1.5 py-0.5 rounded">
                {coins.length}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors" title="Filter">
                <i className="ri-filter-3-line text-sm" />
              </button>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-white/5 transition-colors" title="Refresh">
                <i className="ri-refresh-line text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Coins List - vertical scroll */}
        <div className="flex-1 overflow-y-auto pt-1 scrollbar-styled">
          {renderCoinsList()}
        </div>
      </div>
    </>
  )
}
