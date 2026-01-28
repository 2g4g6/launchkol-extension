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
  topProtocols: { name: string; icon: string; value: string; change: number }[]
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
    topProtocols: [
      { name: 'Raydium', icon: '/images/raydium.svg', value: '$215M', change: 2.1 },
      { name: 'Jupiter', icon: '/images/jupiter.svg', value: '$40.5M', change: -0.3 },
      { name: 'Orca', icon: '/images/orca.svg', value: '$21.4M', change: 11.2 },
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
    topProtocols: [
      { name: 'Raydium', icon: '/images/raydium.svg', value: '$645M', change: 2.5 },
      { name: 'Jupiter', icon: '/images/jupiter.svg', value: '$121M', change: -0.1 },
      { name: 'Orca', icon: '/images/orca.svg', value: '$64.3M', change: 13.8 },
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
    topProtocols: [
      { name: 'Raydium', icon: '/images/raydium.svg', value: '$1.56B', change: 2.9 },
      { name: 'Jupiter', icon: '/images/jupiter.svg', value: '$294M', change: 0.2 },
      { name: 'Orca', icon: '/images/orca.svg', value: '$155M', change: 14.1 },
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
    topProtocols: [
      { name: 'Raydium', icon: '/images/raydium.svg', value: '$2.58B', change: 3.182 },
      { name: 'Jupiter', icon: '/images/jupiter.svg', value: '$486M', change: 0.44 },
      { name: 'Orca', icon: '/images/orca.svg', value: '$257M', change: 15.62 },
    ],
  },
}

const TIME_FRAMES: TimeFrame[] = ['5m', '1h', '6h', '24h']
const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const
const POPOVER_WIDTH = 340
const VIEWPORT_PADDING = 8

// ============================================================================
// Helper Components
// ============================================================================

function ChangeText({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span className={`text-[11px] font-mono ${isPositive ? 'text-kol-green' : 'text-kol-red'}`}>
      {isPositive ? '+' : ''}{value}%
    </span>
  )
}

function StatCard({ label, value, icon, change }: { label: string; value: string; icon: string; change: number }) {
  return (
    <div className="bg-kol-surface border border-kol-border rounded-lg px-3 py-2 flex-1 min-w-0">
      <div className="text-[10px] text-kol-text-muted font-body mb-0.5">{label}</div>
      <div className="flex items-center gap-1.5">
        <i className={`${icon} text-[12px] text-kol-text-muted`} />
        <span className="text-[12px] text-white font-mono font-medium">{value}</span>
        <ChangeText value={change} />
      </div>
    </div>
  )
}

function PlatformBadge({ name, icon, value, change }: { name: string; icon: string; value: string; change: number }) {
  const isPositive = change >= 0
  return (
    <div className="flex flex-col items-center gap-0.5 bg-kol-surface border border-kol-border rounded-lg px-2.5 py-1.5 flex-1 min-w-0">
      <img src={icon} alt={name} className="w-4 h-4 rounded-full" />
      <span className="text-[11px] text-white font-mono font-medium">{value}</span>
      <span className={`text-[9px] font-mono ${isPositive ? 'text-kol-green' : 'text-kol-red'}`}>
        {isPositive ? '+' : ''}{change}%
      </span>
    </div>
  )
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
          <div className="bg-kol-bg border border-kol-border rounded-lg shadow-xl shadow-black/40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-kol-border">
              <div className="flex items-center gap-2">
                <span className="w-[6px] h-[6px] rounded-full bg-kol-green" />
                <span className="text-[13px] font-display font-semibold text-white">Market Lighthouse</span>
              </div>
              <div className="flex items-center gap-0.5 bg-kol-surface rounded p-0.5">
                {TIME_FRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeFrame(tf)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      timeFrame === tf
                        ? 'bg-kol-blue text-white'
                        : 'text-kol-text-muted hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="p-3 space-y-2.5">
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

              {/* 24h Volume */}
              <div className="bg-kol-surface border border-kol-border rounded-lg px-3 py-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-kol-text-muted font-body">24h Vol</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] text-white font-mono font-medium">{data.volume24h.value}</span>
                    <ChangeText value={data.volume24h.change} />
                  </div>
                </div>
                <div className="w-full h-[5px] rounded-full overflow-hidden flex">
                  <div className="bg-kol-green h-full" style={{ width: '55%' }} />
                  <div className="bg-kol-red h-full" style={{ width: '45%' }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-kol-green font-mono">{data.volumeBar.left}</span>
                  <span className="text-[9px] text-kol-red font-mono">{data.volumeBar.right}</span>
                </div>
              </div>

              {/* Token Stats */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <i className="ri-coin-line text-[12px] text-kol-text-muted" />
                  <span className="text-[11px] text-kol-text-muted font-body font-medium">Token Stats</span>
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

              {/* Top Launchpads */}
              <div>
                <span className="text-[10px] text-kol-text-muted font-body block mb-1.5">Top Launchpads</span>
                <div className="flex gap-1.5">
                  {data.topLaunchpads.map((lp) => (
                    <PlatformBadge key={lp.name} {...lp} />
                  ))}
                </div>
              </div>

              {/* Top Protocols */}
              <div>
                <span className="text-[10px] text-kol-text-muted font-body block mb-1.5">Top Protocols</span>
                <div className="flex gap-1.5">
                  {data.topProtocols.map((p) => (
                    <PlatformBadge key={p.name} {...p} />
                  ))}
                </div>
              </div>
            </div>
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
