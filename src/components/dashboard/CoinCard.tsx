import { motion } from 'framer-motion'
import { useState } from 'react'
import { Tooltip } from '../ui/Tooltip'

// Platform types
export type PlatformType = 'pump' | 'bonk' | 'bags' | 'mayhem' | 'fourmeme' | 'raydium'

// Tweet types
export type TweetType = 'tweet' | 'reply' | 'retweet' | 'quote' | 'pin' | 'follow' | 'delete' | 'profile'

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
  tweetType?: TweetType
  launchedAt: Date
  progressPercent?: number
  axiomUrl?: string
  buyTxns?: number
  sellTxns?: number
}

interface CoinCardProps {
  coin: CoinData
  index: number
  onView: (coin: CoinData) => void
  onDevPanel?: (coin: CoinData) => void
  onRelaunch?: (coin: CoinData) => void
}

// Platform configuration with colors matching Axiom
const PLATFORM_CONFIG: Record<PlatformType, { name: string; logo: string; color: string; ringColor: string; urlPattern: string }> = {
  pump: { name: 'Pump.fun', logo: '/images/pump.svg', color: 'bg-green-500/20 border-green-500/40', ringColor: '#00c46b', urlPattern: 'https://pump.fun/{address}' },
  bonk: { name: 'Bonk.fun', logo: '/images/bonk.svg', color: 'bg-orange-500/20 border-orange-500/40', ringColor: '#f97316', urlPattern: 'https://bonk.fun/{address}' },
  bags: { name: 'Bags', logo: '/images/bags.svg', color: 'bg-purple-500/20 border-purple-500/40', ringColor: '#a855f7', urlPattern: 'https://bags.fm/{address}' },
  mayhem: { name: 'Mayhem', logo: '/images/mayhem.svg', color: 'bg-red-500/20 border-red-500/40', ringColor: '#ff4d4f', urlPattern: 'https://mayhem.fun/{address}' },
  fourmeme: { name: '4Meme', logo: '/images/fourmeme.svg', color: 'bg-pink-500/20 border-pink-500/40', ringColor: '#ec4899', urlPattern: 'https://4meme.fun/{address}' },
  raydium: { name: 'Raydium', logo: '/images/raydium.svg', color: 'bg-indigo-500/20 border-indigo-500/40', ringColor: '#6366f1', urlPattern: 'https://raydium.io/swap/?inputMint=sol&outputMint={address}' },
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

// Token Image Component (simplified flat design)
function TokenImage({
  image,
  symbol,
  platform
}: {
  image?: string
  symbol: string
  platform: PlatformType
}) {
  const imageSize = 64

  return (
    <div className="relative" style={{ width: imageSize, height: imageSize }}>
      {image ? (
        <img
          src={image}
          alt={symbol}
          className="rounded-md object-cover"
          style={{ width: imageSize, height: imageSize }}
        />
      ) : (
        <div
          className="rounded-md bg-kol-bg flex items-center justify-center text-lg font-bold text-kol-text-muted"
          style={{ width: imageSize, height: imageSize }}
        >
          {symbol.slice(0, 2)}
        </div>
      )}

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

  return (
    <span className="text-[16px] font-medium text-kol-green">
      {formatTime()}
    </span>
  )
}

// Trading Stats Bar Component (Bought, Sold, Holding, PnL)
function TradingStatsBar({
  stats,
  pnl,
  holdings,
  holdingsSol,
  symbol
}: {
  stats: TradingStats
  pnl: number
  holdings: number
  holdingsSol?: number
  symbol: string
}) {
  const isProfitable = pnl >= 0

  return (
    <div className="flex max-h-[64px] min-h-[64px] flex-1 flex-row items-center justify-center py-2 border-t border-kol-border/20">
      {/* Bought */}
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        <span className="text-[12px] font-normal leading-4 text-kol-text-muted">Bought</span>
        <div className="flex flex-row items-center gap-1">
          <img alt="SOL" width="14" height="14" src="/images/solanaLogoMark.svg" />
          <span className="text-[12px] font-medium leading-4 text-kol-green">{stats.boughtAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-12 w-px bg-kol-border/40" />

      {/* Sold */}
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        <span className="text-[12px] font-normal leading-4 text-kol-text-muted">Sold</span>
        <div className="flex flex-row items-center gap-1">
          <img alt="SOL" width="14" height="14" src="/images/solanaLogoMark.svg" />
          <span className="text-[12px] font-medium leading-4 text-kol-red">{stats.soldAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-12 w-px bg-kol-border/40" />

      {/* Holding */}
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        <span className="text-[12px] font-normal leading-4 text-kol-text-muted">Holding</span>
        <div className="group flex flex-row items-center gap-1">
          <div className="flex flex-row items-center gap-1 group-hover:hidden">
            <img alt="SOL" width="14" height="14" src="/images/solanaLogoMark.svg" />
            <span className="text-[12px] font-medium leading-4 text-kol-text-secondary">{(holdingsSol ?? holdings).toFixed(2)}</span>
          </div>
          <span className="hidden text-[12px] font-medium leading-4 text-kol-text-secondary group-hover:inline">
            {holdings.toFixed(2)} {symbol}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-12 w-px bg-kol-border/40" />

      {/* PnL */}
      <div className="flex min-w-[100px] flex-col items-center justify-center gap-1 px-1">
        <div className="flex h-4 flex-row items-center justify-center">
          <button className="group flex flex-row items-center justify-center gap-1 rounded px-1.5 pl-2 transition-colors duration-150 ease-in-out hover:cursor-pointer hover:bg-kol-border/50">
            <span className="text-[12px] font-normal leading-4 text-kol-text-muted transition-colors duration-150 ease-in-out group-hover:text-kol-text-secondary">PnL</span>
            <i className="ri-exchange-dollar-line text-[14px] text-kol-text-muted transition-colors duration-150 ease-in-out group-hover:text-kol-text-secondary" />
          </button>
        </div>
        <div className="flex flex-row items-center gap-1">
          <img alt="SOL" width="14" height="14" src="/images/solanaLogoMark.svg" />
          <span className={`text-nowrap text-[12px] font-medium leading-4 ${isProfitable ? 'text-kol-green' : 'text-kol-red'}`}>
            {isProfitable ? '+' : ''}{pnl.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
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

// TXN Stats Component (buy/sell transaction counts with full-width visual bar)
function TxnStats({ buyTxns, sellTxns }: { buyTxns: number; sellTxns: number }) {
  const total = buyTxns + sellTxns
  const buyPercent = total > 0 ? (buyTxns / total) * 100 : 50

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Stats on the left */}
      <div className="flex items-center gap-1 text-[14px] font-medium flex-shrink-0">
        <Tooltip content="Buy transactions" position="top">
          <span className="font-mono cursor-default" style={{ color: '#00d492' }}>{buyTxns}</span>
        </Tooltip>
        <span className="text-kol-text-muted">/</span>
        <Tooltip content="Sell transactions" position="top">
          <span className="font-mono text-kol-red cursor-default">{sellTxns}</span>
        </Tooltip>
      </div>
      {/* Visual ratio bar - on the right */}
      <div className="flex h-[2px] flex-1 flex-row items-center gap-[4px]">
        <div
          className="flex h-[2px] rounded-l-full"
          style={{ width: `${buyPercent}%`, backgroundColor: '#00d492' }}
        />
        <div className="flex h-[2px] flex-1 rounded-r-full bg-kol-red" />
      </div>
    </div>
  )
}

// Tweet Type Icon Helper
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

// Tweet Type Color Helper (colors match Twitter's actual display)
function getTweetTypeColor(type?: TweetType): string {
  switch (type) {
    case 'reply': return '#00c46b'     // GREEN (matches Twitter)
    case 'retweet': return '#00c46b'   // GREEN
    case 'quote': return '#ff9500'     // ORANGE
    case 'pin': return '#ffd700'       // GOLD
    case 'follow': return '#ff4d4f'    // RED
    case 'delete': return '#ff6b6b'    // RED
    case 'profile': return '#8b5cf6'   // PURPLE
    case 'tweet':
    default: return '#00bfa6'          // TEAL
  }
}

// Quick Links Component
function QuickLinks({ coin }: { coin: CoinData }) {
  const tweetIcon = getTweetTypeIcon(coin.tweetType)
  const tweetColor = getTweetTypeColor(coin.tweetType)
  const platformConfig = PLATFORM_CONFIG[coin.platform]
  const platformUrl = platformConfig.urlPattern.replace('{address}', coin.address)

  return (
    <div className="flex items-center gap-2">
      {coin.twitterUrl && (
        <a
          href={coin.twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center transition-colors hover:opacity-80"
          title="View source tweet"
          style={{ color: tweetColor }}
        >
          <i className={`${tweetIcon} text-[20px]`} />
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
        <i className="ri-search-line text-[20px]" />
      </a>
      <a
        href={platformUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center hover:opacity-80 transition-opacity"
        title={`View on ${platformConfig.name}`}
      >
        <img src={platformConfig.logo} alt={platformConfig.name} className="w-5 h-5 object-contain" />
      </a>
      {coin.axiomUrl && (
        <a
          href={coin.axiomUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center text-white hover:opacity-80 transition-opacity"
          title="Trade on Axiom"
        >
          <AxiomIcon className="w-6 h-6" />
        </a>
      )}
    </div>
  )
}

export function CoinCard({ coin, index, onView, onDevPanel, onRelaunch }: CoinCardProps) {
  return (
    <motion.div
      className="group relative mx-3 my-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="relative bg-kol-surface border border-kol-border/80 rounded-lg hover:bg-kol-surface-elevated hover:border-kol-border-hover transition-colors duration-200 cursor-pointer overflow-hidden"
        onClick={() => onView(coin)}
      >
        {/* MAIN CONTENT - 3 column layout */}
        <div className="flex items-start gap-3 p-3">

          {/* LEFT: Image + Address */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <TokenImage
              image={coin.image}
              symbol={coin.symbol}
              platform={coin.platform}
            />
            <CompactContractAddress address={coin.address} />
          </div>

          {/* MIDDLE: Token Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
            {/* Row 1: Ticker (white) + Name (grey) with copy */}
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

            {/* Row 2: Time + Quick Links */}
            <div className="flex items-center gap-3">
              <TimeBadge date={coin.launchedAt} />
              <QuickLinks coin={coin} />
            </div>
          </div>

          {/* RIGHT: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDevPanel?.(coin)
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-md text-[14px] font-medium bg-kol-blue/20 border border-kol-blue/40 text-white hover:bg-kol-blue/30 transition-colors"
            >
              Manage
              <i className="ri-code-s-slash-line text-[16px]" />
            </button>
            <Tooltip content="Relaunch token" position="top">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRelaunch?.(coin)
                }}
                className="flex items-center justify-center w-12 h-12 rounded-md bg-kol-surface-elevated border border-kol-border text-kol-text-muted hover:border-kol-border-hover hover:text-white transition-colors"
              >
                <i className="ri-restart-line text-[18px]" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* TXN Stats Row - aligned with middle content */}
        {coin.buyTxns !== undefined && (
          <div className="-mt-8 pl-28 pr-10">
            <TxnStats buyTxns={coin.buyTxns} sellTxns={coin.sellTxns ?? 0} />
          </div>
        )}

        {/* TRADING STATS BAR */}
        {coin.tradingStats && (
          <TradingStatsBar
            stats={coin.tradingStats}
            pnl={coin.pnl}
            holdings={coin.holdings}
            holdingsSol={coin.holdingsSol}
            symbol={coin.symbol}
          />
        )}
      </div>
    </motion.div>
  )
}
