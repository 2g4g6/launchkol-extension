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

// Platform configuration with colors matching Axiom
const PLATFORM_CONFIG: Record<PlatformType, { name: string; logo: string; color: string; ringColor: string }> = {
  pump: { name: 'Pump.fun', logo: '/images/pump.svg', color: 'bg-green-500/20 border-green-500/40', ringColor: '#00c46b' },
  bonk: { name: 'Bonk.fun', logo: '/images/bonk.svg', color: 'bg-orange-500/20 border-orange-500/40', ringColor: '#f97316' },
  bags: { name: 'Bags', logo: '/images/bags.svg', color: 'bg-purple-500/20 border-purple-500/40', ringColor: '#a855f7' },
  mayhem: { name: 'Mayhem', logo: '/images/mayhem.svg', color: 'bg-red-500/20 border-red-500/40', ringColor: '#ff4d4f' },
  fourmeme: { name: '4Meme', logo: '/images/fourmeme.svg', color: 'bg-pink-500/20 border-pink-500/40', ringColor: '#ec4899' },
  raydium: { name: 'Raydium', logo: '/images/raydium.svg', color: 'bg-indigo-500/20 border-indigo-500/40', ringColor: '#6366f1' },
}

// Platform Badge Component
function PlatformBadge({ platform }: { platform: PlatformType }) {
  const config = PLATFORM_CONFIG[platform]
  return (
    <div
      className="absolute z-30 flex h-[16px] w-[16px] items-center justify-center rounded-full p-[1px]"
      style={{ bottom: '-4px', right: '-4px', background: config.ringColor }}
    >
      <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-kol-bg">
        <img src={config.logo} alt={config.name} className="w-2.5 h-2.5 object-cover" onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
        }} />
      </div>
    </div>
  )
}

// Rectangular Progress Ring Component (like Axiom)
function RectangularProgressRing({
  progress,
  platform,
  size = 74
}: {
  progress?: number
  platform: PlatformType
  size?: number
}) {
  const config = PLATFORM_CONFIG[platform]
  const svgSize = size + 4 // SVG is slightly larger than container
  const cornerRadius = 4

  // Calculate the path for a rounded rectangle
  // Path goes: bottom-right -> bottom-left -> top-left -> top-right -> back to bottom-right
  const pathD = `
    M ${svgSize - 2} ${svgSize - 2}
    L ${cornerRadius + 2} ${svgSize - 2}
    Q 2 ${svgSize - 2} 2 ${svgSize - cornerRadius - 2}
    L 2 ${cornerRadius + 2}
    Q 2 2 ${cornerRadius + 2} 2
    L ${svgSize - cornerRadius - 2} 2
    Q ${svgSize - 2} 2 ${svgSize - 2} ${cornerRadius + 2}
    L ${svgSize - 2} ${svgSize - cornerRadius - 2}
    Q ${svgSize - 2} ${svgSize - 2} ${svgSize - 2} ${svgSize - 2}
  `

  // Calculate perimeter for dash array (approximate)
  const perimeter = (size * 4) + (Math.PI * cornerRadius * 2)
  const progressPercent = progress !== undefined ? progress : 97
  const dashOffset = perimeter - (progressPercent / 100) * perimeter

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      className="absolute left-0 top-0 z-10"
      style={{ marginLeft: '-2px', marginTop: '-2px' }}
    >
      {/* Background track */}
      <path
        d={pathD}
        fill="transparent"
        stroke={config.ringColor}
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Progress indicator */}
      <path
        d={pathD}
        fill="transparent"
        stroke={config.ringColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray={perimeter}
        strokeDashoffset={dashOffset}
        className="transition-all duration-300 ease-in-out"
      />
    </svg>
  )
}

// Token Image with Rectangular Progress Ring Component
function TokenImageWithProgress({
  image,
  symbol,
  progress,
  platform
}: {
  image?: string
  symbol: string
  progress?: number
  platform: PlatformType
}) {
  const config = PLATFORM_CONFIG[platform]
  const containerSize = 74
  const innerSize = 72
  const imageSize = 68

  return (
    <div className="relative" style={{ width: containerSize, height: containerSize }}>
      {/* Rectangular progress ring */}
      <RectangularProgressRing progress={progress} platform={platform} size={containerSize} />

      {/* Image container with platform-colored background */}
      <div
        className="absolute flex items-center justify-start p-[1px] rounded-[4px] z-20"
        style={{ background: `${config.ringColor}20` }}
      >
        <div
          className="bg-kol-surface-elevated relative rounded-[3px]"
          style={{ width: innerSize, height: innerSize }}
        >
          <div className="absolute inset-0 p-[2px]">
            <div
              className="group/image relative flex-shrink-0"
              style={{ width: imageSize, height: imageSize }}
            >
              <div className="relative h-full w-full">
                {/* Inner border overlay */}
                <div
                  className="pointer-events-none absolute border border-white/10 z-10 rounded-[1px]"
                  style={{ width: imageSize, height: imageSize }}
                />
                {image ? (
                  <img
                    src={image}
                    alt={symbol}
                    className="rounded-[1px] object-cover"
                    style={{ width: imageSize, height: imageSize }}
                  />
                ) : (
                  <div
                    className="rounded-[1px] bg-kol-surface flex items-center justify-center text-lg font-bold text-kol-text-muted"
                    style={{ width: imageSize, height: imageSize }}
                  >
                    {symbol.slice(0, 2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform badge */}
      <PlatformBadge platform={platform} />
    </div>
  )
}

// Compact Contract Address Component
function CompactContractAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)
  const short = `${address.slice(0, 4)}...${address.slice(-4)}`

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[12px] font-medium text-kol-text-tertiary hover:text-kol-blue-hover transition-colors"
    >
      <span>{short}</span>
      <i className={`text-[10px] ${copied ? 'ri-check-line text-kol-green' : ''}`} />
    </button>
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
    if (diffMinutes < 30) return 'text-kol-green'
    if (diffMinutes < 120) return 'text-yellow-400'
    return 'text-kol-text-muted'
  }

  return (
    <span className={`text-[14px] font-medium ${getTimeColor()}`}>
      {formatTime()}
    </span>
  )
}

// Inline Trading Stats Component
function InlineTradingStats({
  stats,
  pnl
}: {
  stats: TradingStats
  pnl: number
}) {
  const isProfitable = pnl >= 0

  return (
    <div className="flex items-center gap-1.5 text-[11px] mt-1">
      {/* Bought */}
      <div className="flex items-center gap-0.5">
        <span className="text-kol-text-muted">B:</span>
        <img src="/images/sol-fill.svg" alt="SOL" className="w-3 h-3" />
        <span className="text-kol-green font-medium">{stats.boughtAmount.toFixed(2)}</span>
      </div>

      <span className="text-kol-border">|</span>

      {/* Sold */}
      <div className="flex items-center gap-0.5">
        <span className="text-kol-text-muted">S:</span>
        <img src="/images/sol-fill.svg" alt="SOL" className="w-3 h-3" />
        <span className="text-kol-red font-medium">{stats.soldAmount.toFixed(2)}</span>
      </div>

      <span className="text-kol-border">|</span>

      {/* PnL */}
      <div className="flex items-center gap-0.5">
        <span className="text-kol-text-muted">PnL:</span>
        <img src="/images/sol-fill.svg" alt="SOL" className="w-3 h-3" />
        <span className={`font-medium ${isProfitable ? 'text-kol-green' : 'text-kol-red'}`}>
          {isProfitable ? '+' : ''}{pnl.toFixed(2)}
        </span>
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
    ? 'bg-kol-blue/15 text-kol-blue border-kol-blue/30 hover:bg-kol-blue/25'
    : 'bg-kol-surface/50 text-kol-text-muted border-kol-border/30 hover:bg-kol-surface-elevated hover:text-white'

  return (
    <motion.button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold border transition-colors ${variantClasses}`}
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
          className="flex items-center text-kol-text-muted hover:text-kol-blue-hover transition-colors"
          title="View source tweet"
        >
          <i className="ri-twitter-x-line text-[16px]" />
        </a>
      )}
      {coin.axiomUrl && (
        <a
          href={coin.axiomUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center text-kol-text-muted hover:text-kol-blue-hover transition-colors"
          title="Open in Axiom"
        >
          <svg width="16" height="16" viewBox="0 0 36 36" fill="currentColor">
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
        className="flex items-center text-kol-text-muted hover:text-kol-blue-hover transition-colors"
        title="Search on X"
      >
        <i className="ri-search-line text-[16px]" />
      </a>
    </div>
  )
}

export function CoinCard({ coin, index, onView, onTradePanel, onDevPanel, onVamp, onRelaunch }: CoinCardProps) {
  const isProfitable = coin.pnl >= 0

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
        {/* MAIN CONTENT - 3 column layout */}
        <div className="flex items-start gap-3 p-3">

          {/* LEFT: Image + Address */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <TokenImageWithProgress
              image={coin.image}
              symbol={coin.symbol}
              progress={coin.progressPercent}
              platform={coin.platform}
            />
            <CompactContractAddress address={coin.address} />
          </div>

          {/* MIDDLE: Token Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
            {/* Ticker (white) + Name (grey) with copy */}
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-medium text-white truncate tracking-[-0.02em]">
                {coin.symbol}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(coin.name)
                }}
                className="flex items-center gap-1 text-[16px] font-medium text-kol-text-muted hover:text-kol-blue-hover transition-colors min-w-0"
              >
                <span className="truncate">{coin.name}</span>
                <i className="ri-file-copy-line text-[14px]" />
              </button>
            </div>

            {/* Time + Quick Links */}
            <div className="flex items-center gap-3">
              <TimeBadge date={coin.launchedAt} />
              <QuickLinks coin={coin} />
            </div>

            {/* Inline Trading Stats */}
            {coin.tradingStats && (
              <InlineTradingStats stats={coin.tradingStats} pnl={coin.pnl} />
            )}
          </div>

          {/* RIGHT: Holdings */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <img src="/images/sol-fill.svg" alt="SOL" className="w-3 h-3" />
              <span className="text-[11px] font-medium text-white">{coin.holdings.toFixed(2)}</span>
            </div>

            <div className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              isProfitable ? 'text-kol-green bg-kol-green/10' : 'text-kol-red bg-kol-red/10'
            }`}>
              <i className={`text-[8px] ${isProfitable ? 'ri-arrow-up-s-fill' : 'ri-arrow-down-s-fill'}`} />
              {isProfitable ? '+' : ''}{coin.pnlPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-1.5 p-2 border-t border-kol-border/20">
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
