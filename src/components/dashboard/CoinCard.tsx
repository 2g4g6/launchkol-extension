import { motion } from 'framer-motion'

export interface CoinData {
  id: string
  name: string
  symbol: string
  image?: string
  address: string
  holdings: number
  holdingsUsd: number
  pnl: number
  pnlPercent: number
  marketCap?: number
  launchedAt: Date
}

interface CoinCardProps {
  coin: CoinData
  index: number
  onSell: (coin: CoinData, percent: number) => void
  onView: (coin: CoinData) => void
}

export function CoinCard({ coin, index, onSell, onView }: CoinCardProps) {
  const isProfitable = coin.pnl >= 0
  const sellPercentages = [25, 50, 75, 100]

  const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{
          background: isProfitable
            ? 'radial-gradient(circle at 50% 50%, rgba(0, 196, 107, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255, 77, 79, 0.15) 0%, transparent 70%)',
        }}
      />

      <div
        className="relative bg-kol-surface-elevated/40 backdrop-blur-md border border-kol-border/40 rounded-xl p-3 hover:border-kol-border/60 hover:bg-kol-surface-elevated/60 transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={() => onView(coin)}
      >
        {/* PnL indicator line with glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: isProfitable
              ? 'linear-gradient(90deg, transparent 0%, #00c46b 50%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, #ff4d4f 50%, transparent 100%)',
            boxShadow: isProfitable
              ? '0 0 10px rgba(0, 196, 107, 0.5)'
              : '0 0 10px rgba(255, 77, 79, 0.5)',
          }}
        />

        <div className="flex gap-3">
          {/* Token Image */}
          <div className="relative flex-shrink-0">
            {coin.image ? (
              <img
                src={coin.image}
                alt={coin.name}
                className="w-11 h-11 rounded-xl object-cover border border-kol-border/40"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-kol-blue/30 to-kol-green/20 flex items-center justify-center border border-kol-border/40">
                <span className="text-sm font-body font-bold text-white">
                  {coin.symbol.charAt(0)}
                </span>
              </div>
            )}
            {/* SOL badge */}
            <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center border-2 border-kol-bg shadow-sm">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              </svg>
            </div>
            {/* Token glow */}
            <div
              className="absolute inset-0 rounded-xl blur-md -z-10 opacity-40"
              style={{
                background: isProfitable
                  ? 'radial-gradient(circle, rgba(0, 196, 107, 0.3) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255, 77, 79, 0.2) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm font-body font-semibold text-white truncate">
                {coin.name}
              </span>
              <span className="text-[10px] font-mono text-kol-text-muted bg-kol-surface/50 px-1.5 py-0.5 rounded">
                ${coin.symbol}
              </span>
            </div>

            {/* Holdings and PnL row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono font-medium text-white">
                  {coin.holdings.toFixed(2)} SOL
                </span>
                <span className="text-[10px] text-kol-text-muted">
                  (${coin.holdingsUsd.toFixed(2)})
                </span>
              </div>
              <div className={`flex items-center gap-0.5 text-[12px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                isProfitable
                  ? 'text-kol-green bg-kol-green/10'
                  : 'text-kol-red bg-kol-red/10'
              }`}>
                <i className={`text-[10px] ${isProfitable ? 'ri-arrow-up-s-fill' : 'ri-arrow-down-s-fill'}`} />
                {isProfitable ? '+' : ''}{coin.pnlPercent.toFixed(1)}%
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 text-[10px] text-kol-text-muted">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(coin.address)
                }}
                className="flex items-center gap-1 hover:text-kol-text-secondary transition-colors"
              >
                <i className="ri-file-copy-line" />
                {formatAddress(coin.address)}
              </button>
              <span className="text-kol-text-muted/60">·</span>
              <span>{formatTime(coin.launchedAt)}</span>
              {coin.marketCap && (
                <>
                  <span className="text-kol-text-muted/60">·</span>
                  <span className="text-kol-text-tertiary">MC: ${(coin.marketCap / 1000).toFixed(1)}K</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sell Buttons */}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-kol-border/20">
          {sellPercentages.map((percent) => (
            <motion.button
              key={percent}
              onClick={(e) => {
                e.stopPropagation()
                onSell(coin, percent)
              }}
              className="relative flex-1 py-1.5 rounded-lg text-[11px] font-body font-semibold overflow-hidden group/sell"
              style={{
                border: '1px solid rgba(255, 77, 79, 0.25)',
                color: '#ff4d4f',
                backgroundColor: 'rgba(255, 77, 79, 0.05)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover/sell:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(255, 77, 79, 0.15) 0%, transparent 70%)',
                }}
              />
              <span className="relative">{percent}%</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
