import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

// ============================================================================
// Types
// ============================================================================

type TimeFrame = '5m' | '1h' | '6h' | '24h'

// ============================================================================
// Mock Data (replace with API data)
// ============================================================================

const MOCK_DATA: Record<TimeFrame, {
  totalTrades: { value: string; change: number }
  traders: { value: string; change: number }
  volume24h: { value: string; change: number }
  volumeBar: { left: string; right: string }
  created: { value: string; change: number }
  migrations: { value: string; change: number }
  topLaunchpads: { name: string; icon: string; value: string; change: number }[]
}> = {
  '5m': {
    totalTrades: { value: '1.2M', change: -2.31 },
    traders: { value: '56K', change: -1.2 },
    volume24h: { value: '$332M', change: -0.42 },
    volumeBar: { left: '665K / $167M', right: '552K / $166M' },
    created: { value: '4.8K', change: -3.1 },
    migrations: { value: '28', change: -12.5 },
    topLaunchpads: [
      { name: 'Pump.fun', icon: '/images/pump.svg', value: '$33.2M', change: -18.4 },
      { name: 'Bonk.fun', icon: '/images/bonk.svg', value: '$2.2M', change: -25.1 },
      { name: 'Bags', icon: '/images/bags.svg', value: '$1.8M', change: -14.7 },
    ],
  },
  '1h': {
    totalTrades: { value: '3.6M', change: -4.12 },
    traders: { value: '168K', change: -3.5 },
    volume24h: { value: '$998M', change: -0.55 },
    volumeBar: { left: '1.99M / $500M', right: '1.65M / $499M' },
    created: { value: '14.3K', change: -4.2 },
    migrations: { value: '85', change: -15.3 },
    topLaunchpads: [
      { name: 'Pump.fun', icon: '/images/pump.svg', value: '$99.8M', change: -20.1 },
      { name: 'Bonk.fun', icon: '/images/bonk.svg', value: '$6.6M', change: -28.7 },
      { name: 'Bags', icon: '/images/bags.svg', value: '$5.5M', change: -16.2 },
    ],
  },
  '6h': {
    totalTrades: { value: '8.9M', change: -5.82 },
    traders: { value: '412K', change: -4.9 },
    volume24h: { value: '$2.41B', change: -0.58 },
    volumeBar: { left: '4.82M / $1.21B', right: '4.01M / $1.20B' },
    created: { value: '34.7K', change: -4.6 },
    migrations: { value: '207', change: -16.8 },
    topLaunchpads: [
      { name: 'Pump.fun', icon: '/images/pump.svg', value: '$241M', change: -23.5 },
      { name: 'Bonk.fun', icon: '/images/bonk.svg', value: '$15.9M', change: -31.4 },
      { name: 'Bags', icon: '/images/bags.svg', value: '$13.4M', change: -15.9 },
    ],
  },
  '24h': {
    totalTrades: { value: '14.6M', change: -6.59 },
    traders: { value: '674K', change: -5.809 },
    volume24h: { value: '$3.98B', change: -0.63 },
    volumeBar: { left: '7.98M / $2B', right: '6.61M / $1.99B' },
    created: { value: '57.3K', change: -4.923 },
    migrations: { value: '341', change: -18.23 },
    topLaunchpads: [
      { name: 'Pump.fun', icon: '/images/pump.svg', value: '$399M', change: -26.3 },
      { name: 'Bonk.fun', icon: '/images/bonk.svg', value: '$26.3M', change: -35.2 },
      { name: 'Bags', icon: '/images/bags.svg', value: '$22.1M', change: -18.3 },
    ],
  },
}

const TIME_FRAMES: TimeFrame[] = ['5m', '1h', '6h', '24h']
const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const
const POPOVER_WIDTH = 340
const VIEWPORT_PADDING = 8

const RANK_COLORS: Record<number, { text: string; bg: string }> = {
  1: { text: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  2: { text: 'text-gray-300', bg: 'bg-gray-300/10' },
  3: { text: 'text-amber-600', bg: 'bg-amber-600/10' },
}

// ============================================================================
// Helper Components
// ============================================================================

function ChangeText({ value }: { value: number }) {
  const isPositive = value >= 0
  const arrow = isPositive ? 'ri-arrow-up-s-fill' : 'ri-arrow-down-s-fill'
  return (
    <span className={`text-[11px] font-mono inline-flex items-center gap-0.5 ${isPositive ? 'text-kol-green' : 'text-kol-red'}`}>
      <i className={`${arrow} text-[10px]`} />
      {Math.abs(value)}%
    </span>
  )
}

function StatCard({ label, value, icon, change }: { label: string; value: string; icon: string; change: number }) {
  const isPositive = change >= 0
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 flex-1 min-w-0 overflow-hidden"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: isPositive
            ? 'linear-gradient(90deg, transparent, #00c46b, transparent)'
            : 'linear-gradient(90deg, transparent, #ff4d4f, transparent)',
        }}
      />
      <div className="text-[10px] text-kol-text-muted font-body uppercase tracking-wider mb-0.5">{label}</div>
      <div className="flex items-center gap-1.5">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isPositive ? 'bg-kol-green/10' : 'bg-kol-red/10'}`}>
          <i className={`${icon} text-[11px] ${isPositive ? 'text-kol-green' : 'text-kol-red'}`} />
        </div>
        <span className="text-[14px] text-white font-body font-semibold tabular-nums">{value}</span>
        <ChangeText value={change} />
      </div>
    </motion.div>
  )
}

function PlatformBadge({ name, icon, value, change, rank }: { name: string; icon: string; value: string; change: number; rank: number }) {
  const rankStyle = RANK_COLORS[rank] || RANK_COLORS[3]
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative flex flex-col items-center gap-0.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 flex-1 min-w-0"
    >
      {/* Rank indicator */}
      <span className={`absolute top-1 left-1.5 text-[8px] font-mono font-bold ${rankStyle.text}`}>
        #{rank}
      </span>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/[0.06] ${rankStyle.bg}`}>
        <img src={icon} alt={name} className="w-4 h-4 rounded-full" />
      </div>
      <span className="text-[9px] text-kol-text-muted font-body">{name}</span>
      <span className="text-[11px] text-white font-body font-medium">{value}</span>
      <ChangeText value={change} />
    </motion.div>
  )
}

function SectionDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
}

// ============================================================================
// Main Component
// ============================================================================

export function MarketLighthousePopover({ children }: { children: React.ReactElement }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h')

  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const x = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        rect.left + rect.width / 2 - POPOVER_WIDTH / 2,
        window.innerWidth - POPOVER_WIDTH - VIEWPORT_PADDING
      )
    )
    const y = rect.top - 8 // 8px gap above trigger
    setPosition({ x, y })
  }, [])

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(updatePosition)
      const handleUpdate = () => requestAnimationFrame(updatePosition)
      window.addEventListener('scroll', handleUpdate, true)
      window.addEventListener('resize', handleUpdate)
      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('scroll', handleUpdate, true)
        window.removeEventListener('resize', handleUpdate)
      }
    }
  }, [isOpen, updatePosition])

  const handleMouseEnter = useCallback(() => {
    clearTimeout(hideTimeoutRef.current)
    showTimeoutRef.current = setTimeout(() => setIsOpen(true), 300)
  }, [])

  const handleMouseLeave = useCallback(() => {
    clearTimeout(showTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => setIsOpen(false), 200)
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current)
      clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  const data = MOCK_DATA[timeFrame]

  if (!mounted) {
    return (
      <div ref={triggerRef}>
        {children}
      </div>
    )
  }

  const popoverContent = (
    <AnimatePresence>
      {isOpen && position && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 6, transition: { duration: 0.12, ease: CUSTOM_EASE } }}
          transition={{ duration: 0.18, ease: CUSTOM_EASE }}
          className="fixed z-[9999]"
          style={{
            left: position.x,
            bottom: window.innerHeight - position.y,
            width: POPOVER_WIDTH,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="glass gradient-border rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] relative"
              style={{
                background: 'radial-gradient(ellipse at 30% 50%, rgba(0,123,255,0.06) 0%, transparent 70%)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="relative w-[6px] h-[6px]">
                  <span className="absolute inset-0 rounded-full bg-kol-green animate-ping opacity-75" />
                  <span className="relative block w-full h-full rounded-full bg-kol-green" style={{ boxShadow: '0 0 6px rgba(0,196,107,0.5)' }} />
                </span>
                <span className="text-[13px] font-display font-semibold text-white">Market Lighthouse</span>
              </div>
              <div className="relative flex items-center gap-0.5 bg-white/[0.04] rounded p-0.5">
                {TIME_FRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeFrame(tf)}
                    className={`relative z-10 px-1.5 py-0.5 rounded text-[10px] font-body transition-colors ${
                      timeFrame === tf
                        ? 'text-white'
                        : 'text-kol-text-muted hover:text-white'
                    }`}
                  >
                    {timeFrame === tf && (
                      <motion.div
                        layoutId="timeframe-slider"
                        className="absolute inset-0 bg-kol-blue rounded"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tf}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <AnimatePresence mode="wait">
              <motion.div
                key={timeFrame}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: CUSTOM_EASE }}
                className="p-3 space-y-2.5"
              >
                {/* Total Trades & Traders */}
                <div className="flex gap-2">
                  <StatCard
                    label="Total Trades"
                    value={data.totalTrades.value}
                    icon="ri-bar-chart-horizontal-line"
                    change={data.totalTrades.change}
                  />
                  <StatCard
                    label="Traders"
                    value={data.traders.value}
                    icon="ri-group-line"
                    change={data.traders.change}
                  />
                </div>

                <SectionDivider />

                {/* 24h Volume */}
                <div
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 relative overflow-hidden"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 100%, rgba(0,123,255,0.04) 0%, transparent 70%)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-kol-blue/10 flex items-center justify-center">
                        <i className="ri-funds-line text-[11px] text-kol-blue" />
                      </div>
                      <span className="text-[10px] text-kol-text-muted font-body uppercase tracking-wider">24h Vol</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] text-white font-body font-semibold tabular-nums">{data.volume24h.value}</span>
                      <ChangeText value={data.volume24h.change} />
                    </div>
                  </div>
                  <div className="w-full h-[8px] rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '55%' }}
                      transition={{ duration: 0.6, ease: CUSTOM_EASE }}
                      className="h-full rounded-l-full"
                      style={{
                        background: 'linear-gradient(90deg, #00c46b, #00e67a)',
                        boxShadow: '0 0 8px rgba(0,196,107,0.3)',
                      }}
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '45%' }}
                      transition={{ duration: 0.6, ease: CUSTOM_EASE, delay: 0.1 }}
                      className="h-full rounded-r-full"
                      style={{
                        background: 'linear-gradient(90deg, #ff4d4f, #ff7875)',
                        boxShadow: '0 0 8px rgba(255,77,79,0.3)',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-kol-green" />
                      <span className="text-[9px] text-kol-text-muted font-body">Buy</span>
                      <span className="text-[9px] text-kol-green font-mono">{data.volumeBar.left}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-kol-red font-mono">{data.volumeBar.right}</span>
                      <span className="text-[9px] text-kol-text-muted font-body">Sell</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-kol-red" />
                    </div>
                  </div>
                </div>

                <SectionDivider />

                {/* Token Stats */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-kol-blue/10 flex items-center justify-center">
                      <i className="ri-coin-line text-[11px] text-kol-blue" />
                    </div>
                    <span className="text-[11px] text-kol-text-muted font-body font-medium uppercase tracking-wider">Token Stats</span>
                  </div>
                  <div className="flex gap-2">
                    <StatCard
                      label="Created"
                      value={data.created.value}
                      icon="ri-add-circle-line"
                      change={data.created.change}
                    />
                    <StatCard
                      label="Migrations"
                      value={data.migrations.value}
                      icon="ri-link-line"
                      change={data.migrations.change}
                    />
                  </div>
                </div>

                <SectionDivider />

                {/* Top Launchpads */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-kol-blue/10 flex items-center justify-center">
                      <i className="ri-rocket-line text-[11px] text-kol-blue" />
                    </div>
                    <span className="text-[10px] text-kol-text-muted font-body uppercase tracking-wider">Top Launchpads</span>
                  </div>
                  <div className="flex gap-1.5">
                    {data.topLaunchpads.map((lp, i) => (
                      <PlatformBadge key={lp.name} {...lp} rank={i + 1} />
                    ))}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {createPortal(popoverContent, document.body)}
    </>
  )
}

export default MarketLighthousePopover
