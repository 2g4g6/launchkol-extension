import { useState, useRef, useCallback, useEffect } from 'react'
import { CoinCard, CoinData } from './CoinCard'

// Mock data - same as MyCoinsTab
const MOCK_COINS: CoinData[] = [
  {
    id: '1',
    name: 'DogWifHat',
    symbol: 'WIF',
    address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    holdings: 2.45,
    holdingsUsd: 245.50,
    pnl: 89.20,
    pnlPercent: 57.2,
    marketCap: 156000,
    launchedAt: new Date(Date.now() - 3600000 * 24),
  },
  {
    id: '2',
    name: 'Bonk',
    symbol: 'BONK',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    holdings: 0.85,
    holdingsUsd: 85.00,
    pnl: -12.50,
    pnlPercent: -12.8,
    marketCap: 89000,
    launchedAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: '3',
    name: 'Myro',
    symbol: 'MYRO',
    address: 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
    holdings: 5.20,
    holdingsUsd: 520.00,
    pnl: 234.00,
    pnlPercent: 82.1,
    marketCap: 445000,
    launchedAt: new Date(Date.now() - 3600000 * 48),
  },
]

interface CoinsPanelProps {
  isOpen: boolean
  onClose: () => void
  onSell: (coin: CoinData, percent: number) => void
}

// Default sizes
const DEFAULT_WIDTH = 320 // Desktop sidebar width
const MIN_WIDTH = 280
const MAX_WIDTH = 500
const DEFAULT_HEIGHT = 300 // Mobile panel height
const MIN_HEIGHT = 150
const MAX_HEIGHT = 500

export function CoinsPanel({ onSell }: CoinsPanelProps) {
  const [coins] = useState<CoinData[]>(MOCK_COINS)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH)
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleView = (coin: CoinData) => {
    window.open(`https://pump.fun/${coin.address}`, '_blank')
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
            onSell={onSell}
            onView={handleView}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-kol-surface-elevated/50 border border-kol-border/40 flex items-center justify-center mb-3">
            <i className="ri-coin-line text-xl text-kol-text-muted" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">No coins yet</p>
          <p className="text-xs text-kol-text-muted">Your holdings will appear here</p>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar (>=lg) - resizable width */}
      <div
        ref={panelRef}
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
        <div className="flex items-center justify-between px-3 py-3 border-b border-kol-border/30">
          <div className="flex items-center gap-2">
            <i className="ri-coin-line text-sm text-kol-text-muted" />
            <span className="text-sm font-semibold text-white">Your Coins</span>
          </div>
          <span className="text-[10px] font-mono text-kol-text-tertiary bg-kol-surface/50 px-2 py-0.5 rounded-full">
            {coins.length}
          </span>
        </div>

        {/* Coins List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 scrollbar-styled">
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

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <i className="ri-coin-line text-sm text-kol-text-muted" />
            <span className="text-sm font-semibold text-white">Your Coins</span>
            <span className="text-[10px] font-mono text-kol-text-tertiary bg-kol-surface/50 px-2 py-0.5 rounded-full">
              {coins.length}
            </span>
          </div>
        </div>

        {/* Coins List - vertical scroll */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 scrollbar-styled">
          {renderCoinsList()}
        </div>
      </div>
    </>
  )
}
