import { motion } from 'framer-motion'
import { useState } from 'react'

// Platform types
export type PlatformType = 'pump' | 'bonk' | 'bags' | 'mayhem' | 'fourmeme' | 'raydium'

export interface TradingStats {
  boughtAmount: number
  soldAmount: number
}

export interface CoinData {
  id: string
  name: string
  symbol: string
  image?: string
  address: string
  holdings: number
  holdingsUsd: number
  holdingsSol?: number
  pnl: number
  pnlPercent: number
  marketCap?: number
  tradingStats?: TradingStats
  platform: PlatformType
  twitterUrl?: string
  launchedAt: Date
  progressPercent?: number
  axiomUrl?: string
}

interface CoinCardProps {
  coin: CoinData
  index: number
  onView: (coin: CoinData) => void
  onTradePanel?: (coin: CoinData) => void
  onDevPanel?: (coin: CoinData) => void
  onVamp?: (coin: CoinData) => void
  onRelaunch?: (coin: CoinData) => void
}

// Platform configuration
const PLATFORM_CONFIG: Record<PlatformType, { name: string; logo: string; color: string }> = {
  pump: { name: 'Pump.fun', logo: '/images/pump.svg', color: 'bg-green-500/20 border-green-500/40' },
  bonk: { name: 'Bonk.fun', logo: '/images/bonk.svg', color: 'bg-orange-500/20 border-orange-500/40' },
  bags: { name: 'Bags', logo: '/images/bags.svg', color: 'bg-purple-500/20 border-purple-500/40' },
  mayhem: { name: 'Mayhem', logo: '/images/mayhem.svg', color: 'bg-red-500/20 border-red-500/40' },
  fourmeme: { name: '4Meme', logo: '/images/fourmeme.svg', color: 'bg-pink-500/20 border-pink-500/40' },
  raydium: { name: 'Raydium', logo: '/images/raydium.svg', color: 'bg-indigo-500/20 border-indigo-500/40' },
}

// Progress Ring Component
function ProgressRing({ progress, size, children }: { progress: number; size: number; children: React.ReactNode }) {
  const strokeWidth = 2
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(42, 42, 42, 0.5)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#coin-progress-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id="coin-progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#007bff" />
            <stop offset="100%" stopColor="#00c46b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// Platform Badge Component
function PlatformBadge({ platform }: { platform: PlatformType }) {
  const config = PLATFORM_CONFIG[platform]
  return (
    <div className={`absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full ${config.color} border flex items-center justify-center z-10 bg-kol-bg`}>
      <img src={config.logo} alt={config.name} className="w-2.5 h-2.5" onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none'
      }} />
    </div>
  )
}

// Time Badge Component
function TimeBadge({ date }: { date: Date }) {
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)

  const formatTime = () => {
    if (diffMinutes < 60) return `${diffMinutes}m`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`
    return `${Math.floor(diffMinutes / 1440)}d`
  }

  const getTimeColor = () => {
    if (diffMinutes < 30) return 'text-kol-green bg-kol-green/10'
    if (diffMinutes < 120) return 'text-yellow-400 bg-yellow-400/10'
    return 'text-kol-text-muted bg-kol-surface/50'
  }

  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${getTimeColor()}`}>
      {formatTime()}
    </span>
  )
}

// Contract Address Bar Component
function ContractAddressBar({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-kol-surface/30 border-y border-kol-border/20">
      <code className="text-[11px] font-mono text-kol-text-muted flex-1 truncate">
        {formatAddress(address)}
      </code>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 p-1 rounded hover:bg-kol-surface-elevated text-kol-text-muted hover:text-white transition-colors"
        title="Copy CA"
      >
        <i className={`text-xs ${copied ? 'ri-check-line text-kol-green' : 'ri-file-copy-line'}`} />
      </button>
    </div>
  )
}

// Trading Stats Component
function TradingStatsDisplay({ stats, pnl }: { stats: TradingStats; pnl: number }) {
  const isProfitable = pnl >= 0

  return (
    <div className="grid grid-cols-3 gap-1 px-3 py-2 border-b border-kol-border/20">
      <div className="text-center">
        <p className="text-[9px] text-kol-text-muted mb-0.5">Bought</p>
        <div className="flex items-center justify-center gap-1">
          <img src="/images/sol-fill.svg" alt="SOL" className="w-3 h-3" />
          <span className="text-[11px] font-mono text-kol-green">{stats.boughtAmount.toFixed(2)}</span>
        </div>
      </div>
      <div className="text-center border-x border-kol-border/20">
        <p className="text-[9px] text-kol-text-muted mb-0.5">Sold</p>
        <div className="flex items-center justify-center gap-1">
          <img src="/images/sol-fill.svg" alt="SOL" className="w-3 h-3" />
          <span className="text-[11px] font-mono text-kol-red">{stats.soldAmount.toFixed(2)}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[9px] text-kol-text-muted mb-0.5">PnL</p>
        <div className="flex items-center justify-center gap-1">
          <img src="/images/sol-fill.svg" alt="SOL" className="w-3 h-3" />
          <span className={`text-[11px] font-mono font-medium ${isProfitable ? 'text-kol-green' : 'text-kol-red'}`}>
            {isProfitable ? '+' : ''}{pnl.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Action Button Component
function ActionButton({ icon, label, onClick, variant = 'default' }: {
  icon: string
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: 'default' | 'primary'
}) {
  const variantClasses = variant === 'primary'
    ? 'bg-kol-blue/10 text-kol-blue border-kol-blue/30 hover:bg-kol-blue/20'
    : 'bg-kol-surface/50 text-kol-text-muted border-kol-border/30 hover:bg-kol-surface-elevated hover:text-white'

  return (
    <motion.button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-colors ${variantClasses}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <i className={`${icon} text-xs`} />
      <span>{label}</span>
    </motion.button>
  )
}

// Quick Links Component
function QuickLinks({ coin }: { coin: CoinData }) {
  return (
    <div className="flex items-center gap-1.5">
      {coin.twitterUrl && (
        <a
          href={coin.twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 flex items-center justify-center rounded bg-kol-surface/50 border border-kol-border/30 text-kol-text-muted hover:text-white hover:border-kol-blue/50 transition-all"
          title="View source tweet"
        >
          <i className="ri-twitter-x-line text-[10px]" />
        </a>
      )}
      {coin.axiomUrl && (
        <a
          href={coin.axiomUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 flex items-center justify-center rounded bg-kol-surface/50 border border-kol-border/30 hover:border-kol-blue/50 transition-all"
          title="Open in Axiom"
        >
          <svg width="10" height="10" viewBox="0 0 36 36" fill="currentColor" className="text-kol-text-muted hover:text-white">
            <path d="M24.1384 17.3876H11.8623L18.0001 7.00012L24.1384 17.3876Z" />
            <path d="M31 29.0003L5 29.0003L9.96764 20.5933L26.0324 20.5933L31 29.0003Z" />
          </svg>
        </a>
      )}
      <a
        href={`https://x.com/search?q=${coin.address}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="w-5 h-5 flex items-center justify-center rounded bg-kol-surface/50 border border-kol-border/30 text-kol-text-muted hover:text-white hover:border-kol-blue/50 transition-all"
        title="Search on X"
      >
        <i className="ri-search-line text-[10px]" />
      </a>
    </div>
  )
}

export function CoinCard({ coin, index, onView, onTradePanel, onDevPanel, onVamp, onRelaunch }: CoinCardProps) {
  const isProfitable = coin.pnl >= 0
  const platformConfig = PLATFORM_CONFIG[coin.platform]

  return (
    <motion.div
      className="group relative mx-3 my-2"
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
        className="relative bg-kol-surface-elevated/40 backdrop-blur-md border border-kol-border/40 rounded-xl hover:border-kol-border/60 hover:bg-kol-surface-elevated/60 transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={() => onView(coin)}
      >
        {/* HEADER SECTION */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Token image + info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Token Image with Progress Ring */}
              <div className="relative flex-shrink-0">
                {coin.progressPercent !== undefined ? (
                  <ProgressRing progress={coin.progressPercent} size={44}>
                    {coin.image ? (
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-9 h-9 rounded-lg object-cover border border-kol-border/40"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-kol-blue/30 to-kol-green/20 flex items-center justify-center border border-kol-border/40">
                        <span className="text-sm font-body font-bold text-white">
                          {coin.symbol.charAt(0)}
                        </span>
                      </div>
                    )}
                  </ProgressRing>
                ) : (
                  <>
                    {coin.image ? (
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-10 h-10 rounded-lg object-cover border border-kol-border/40"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-kol-blue/30 to-kol-green/20 flex items-center justify-center border border-kol-border/40">
                        <span className="text-sm font-body font-bold text-white">
                          {coin.symbol.charAt(0)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <PlatformBadge platform={coin.platform} />
              </div>

              {/* Token Name & Symbol */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm font-body font-semibold text-white truncate">
                    {coin.name}
                  </span>
                  <span className="text-[10px] font-mono text-kol-text-muted">
                    ${coin.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TimeBadge date={coin.launchedAt} />
                  <QuickLinks coin={coin} />
                </div>
              </div>
            </div>

            {/* Right: Platform link + Holdings */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <a
                href={`https://pump.fun/${coin.address}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-kol-surface/50 border border-kol-border/30 hover:bg-kol-surface-elevated transition-colors"
              >
                <img src={platformConfig.logo} alt={platformConfig.name} className="h-3.5 w-3.5 rounded" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }} />
                <span className="text-[10px] font-medium text-white">{platformConfig.name}</span>
              </a>
              <div className="flex items-center gap-1 text-right">
                <span className="text-[11px] font-mono text-white">{coin.holdings.toFixed(2)} SOL</span>
                <div className={`flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                  isProfitable ? 'text-kol-green bg-kol-green/10' : 'text-kol-red bg-kol-red/10'
                }`}>
                  <i className={`text-[8px] ${isProfitable ? 'ri-arrow-up-s-fill' : 'ri-arrow-down-s-fill'}`} />
                  {isProfitable ? '+' : ''}{coin.pnlPercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTRACT ADDRESS BAR */}
        <ContractAddressBar address={coin.address} />

        {/* TRADING STATS */}
        {coin.tradingStats && (
          <TradingStatsDisplay stats={coin.tradingStats} pnl={coin.pnl} />
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-1.5 p-2">
          <ActionButton
            icon="ri-line-chart-line"
            label="Trade"
            onClick={(e) => {
              e.stopPropagation()
              onTradePanel?.(coin)
            }}
            variant="primary"
          />
          <ActionButton
            icon="ri-code-s-slash-line"
            label="Dev"
            onClick={(e) => {
              e.stopPropagation()
              onDevPanel?.(coin)
            }}
          />
          <ActionButton
            icon="ri-flashlight-line"
            label="Vamp"
            onClick={(e) => {
              e.stopPropagation()
              onVamp?.(coin)
            }}
          />
          <ActionButton
            icon="ri-restart-line"
            label="Relaunch"
            onClick={(e) => {
              e.stopPropagation()
              onRelaunch?.(coin)
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}
