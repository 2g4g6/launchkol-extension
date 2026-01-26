import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

// Compact coin card for horizontal scroll mode
function CompactCoinCard({
  coin,
  onClick
}: {
  coin: CoinData
  onClick: () => void
}) {
  const isProfitable = coin.pnl >= 0

  return (
    <motion.button
      onClick={onClick}
      className="flex-shrink-0 w-[140px] bg-kol-surface-elevated/40 backdrop-blur-md border border-kol-border/40 rounded-xl p-3 text-left hover:border-kol-border/60 transition-colors"
      whileTap={{ scale: 0.98 }}
    >
      {/* PnL indicator line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
        style={{
          background: isProfitable
            ? 'linear-gradient(90deg, transparent 0%, #00c46b 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, #ff4d4f 50%, transparent 100%)',
        }}
      />

      <div className="flex items-center gap-2 mb-2">
        {/* Token Image */}
        {coin.image ? (
          <img
            src={coin.image}
            alt={coin.name}
            className="w-8 h-8 rounded-lg object-cover border border-kol-border/40"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-kol-blue/30 to-kol-green/20 flex items-center justify-center border border-kol-border/40">
            <span className="text-xs font-body font-bold text-white">
              {coin.symbol.charAt(0)}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{coin.symbol}</p>
          <p className="text-[10px] text-kol-text-muted truncate">{coin.name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-white">
          {coin.holdings.toFixed(2)}
        </span>
        <span className={`text-[11px] font-mono font-semibold ${
          isProfitable ? 'text-kol-green' : 'text-kol-red'
        }`}>
          {isProfitable ? '+' : ''}{coin.pnlPercent.toFixed(1)}%
        </span>
      </div>
    </motion.button>
  )
}

export function CoinsPanel({ isOpen, onClose, onSell }: CoinsPanelProps) {
  const [coins] = useState<CoinData[]>(MOCK_COINS)

  const handleView = (coin: CoinData) => {
    window.open(`https://pump.fun/${coin.address}`, '_blank')
  }

  return (
    <>
      {/* Desktop sidebar (>=lg) - always visible */}
      <div className="hidden lg:flex lg:flex-col h-full bg-kol-surface/50 backdrop-blur-sm border border-kol-border/50 rounded-xl overflow-hidden">
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
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 scrollbar-thin">
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
        </div>
      </div>

      {/* Mobile bottom drawer (<lg) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-kol-bg/95 backdrop-blur-xl border-t border-kol-border/50 rounded-t-2xl"
            style={{ maxHeight: '40vh' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-kol-border/50" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                <i className="ri-coin-line text-sm text-kol-text-muted" />
                <span className="text-sm font-semibold text-white">Your Coins</span>
                <span className="text-[10px] font-mono text-kol-text-tertiary bg-kol-surface/50 px-2 py-0.5 rounded-full">
                  {coins.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-kol-surface transition-colors"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            {/* Horizontal scrollable coins */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
              {coins.length > 0 ? (
                coins.map((coin) => (
                  <CompactCoinCard
                    key={coin.id}
                    coin={coin}
                    onClick={() => handleView(coin)}
                  />
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center py-6 text-kol-text-muted text-sm">
                  No coins yet
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
          />
        )}
      </AnimatePresence>
    </>
  )
}
