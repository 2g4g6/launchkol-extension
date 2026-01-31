import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PLATFORM_OPTIONS } from './FeedSettings/constants'
import { ExpandableButton } from '../ui/ExpandableButton'
import { MarketLighthousePopover } from '../ui/MarketLighthousePopover'
import { QuickLinkPopover } from '../ui/QuickLinkPopover'
import { FeesCardContent } from '../ui/FeesCard'
import { SoundCardContent } from '../ui/SoundCard'
import { LanguageCardContent } from '../ui/LanguageCard'

interface FooterProps {
  solPrice: number
  bnbPrice?: number
  isCoinsVisible: boolean
  isFeedVisible: boolean
  onToggleCoins: () => void
  onToggleFeed: () => void
}

interface Region {
  id: string
  label: string
  icon: string
  ping: number
}

const REGIONS: Region[] = [
  { id: 'us-w', label: 'US-W', icon: 'ri-server-line', ping: 74 },
  { id: 'us-c', label: 'US-C', icon: 'ri-server-line', ping: 94 },
  { id: 'us-e', label: 'US-E', icon: 'ri-server-line', ping: 79 },
  { id: 'eu-w', label: 'EU-W', icon: 'ri-server-line', ping: 106 },
  { id: 'eu-c', label: 'EU-C', icon: 'ri-server-line', ping: 102 },
  { id: 'eu-e', label: 'EU-E', icon: 'ri-server-line', ping: 111 },
  { id: 'asia', label: 'ASIA', icon: 'ri-server-line', ping: 158 },
  { id: 'asia-v2', label: 'ASIA-V2', icon: 'ri-server-line', ping: 155 },
  { id: 'aus', label: 'AUS', icon: 'ri-server-line', ping: 379 },
  { id: 'global', label: 'GLOBAL', icon: 'ri-global-line', ping: 125 },
]

function getPingColor(ping: number): string {
  if (ping < 100) return '#00c46b'
  if (ping < 150) return '#f59e0b'
  if (ping < 200) return '#f97316'
  return '#ff4d4f'
}

function VerticalDivider() {
  return <div className="self-stretch my-2 w-px bg-kol-border flex-shrink-0 mx-1" />
}

function RegionDropdown() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('global')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedRegion = REGIONS.find((r) => r.id === selected) ?? REGIONS[REGIONS.length - 1]

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-kol-border/40 rounded transition-colors duration-150"
      >
        <span className="text-[11px] text-kol-text-muted font-body whitespace-nowrap">
          {selectedRegion.label}
        </span>
        <motion.i
          className="ri-arrow-down-s-line text-[10px] text-kol-text-muted"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full left-0 mb-1.5 w-[200px] bg-kol-surface border border-kol-border rounded-lg shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-kol-border">
              <span className="text-[12px] text-kol-text font-body font-medium">Regions</span>
              <button className="text-kol-text-muted hover:text-kol-text transition-colors">
                <i className="ri-refresh-line text-[13px]" />
              </button>
            </div>

            {/* Region list */}
            <div className="py-1 max-h-[320px] overflow-y-auto">
              {REGIONS.map((region) => {
                const isSelected = region.id === selected
                const pingColor = getPingColor(region.ping)
                return (
                  <button
                    key={region.id}
                    onClick={() => {
                      setSelected(region.id)
                      setOpen(false)
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-kol-border/30 transition-colors ${
                      isSelected ? 'bg-kol-border/20' : ''
                    }`}
                  >
                    <i
                      className={`${region.icon} text-[13px]`}
                      style={{ color: pingColor }}
                    />
                    <span
                      className={`text-[12px] font-body flex-1 text-left ${
                        isSelected ? 'text-kol-text font-medium' : 'text-kol-text-muted'
                      }`}
                    >
                      {region.label}
                    </span>
                    <span
                      className="text-[11px] font-body tabular-nums"
                      style={{ color: pingColor }}
                    >
                      {region.ping}ms
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BnbIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 18 18" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M3.57583 9L3.58452 12.0945L6.29036 13.6418V15.4535L2.00097 13.0088V8.09508L3.57583 9ZM3.57583 5.90546V7.70873L2 6.80288V4.99961L3.57583 4.09375L5.15939 4.99961L3.57583 5.90546ZM7.42036 4.99961L8.9962 4.09375L10.5797 4.99961L8.9962 5.90546L7.42036 4.99961Z" fill="#F0B90B" />
      <path d="M4.71436 11.4531V9.64141L6.29019 10.5473V12.3505L4.71436 11.4531ZM7.4202 14.2907L8.99603 15.1966L10.5796 14.2907V16.094L8.99603 16.9998L7.4202 16.094V14.2907ZM12.8396 4.99961L14.4154 4.09375L15.999 4.99961V6.80288L14.4154 7.70873V5.90546L12.8396 4.99961ZM14.4154 12.0945L14.4241 9L15.9999 8.09414V13.0079L11.7106 15.4526V13.6409L14.4154 12.0945Z" fill="#F0B90B" />
      <path d="M13.2853 11.4543L11.7095 12.3517V10.5484L13.2853 9.64258V11.4543Z" fill="#F0B90B" />
      <path d="M13.2854 6.54672L13.2941 8.35843L10.5805 9.9057V13.0077L9.00471 13.9052L7.42888 13.0077V9.9057L4.71532 8.35843V6.54672L6.29791 5.64087L8.99506 7.19564L11.7086 5.64087L13.2922 6.54672H13.2854ZM4.71436 3.45312L8.99603 1L13.2854 3.45312L11.7096 4.35898L8.99603 2.80421L6.29019 4.35898L4.71436 3.45312Z" fill="#F0B90B" />
    </svg>
  )
}

function PlatformPill() {
  return (
    <div
      className="relative rounded-full p-[1px] flex-shrink-0 hover:opacity-80 transition-opacity cursor-default"
      style={{ background: 'linear-gradient(135deg, rgba(0,220,130,0.4), rgba(168,85,247,0.4), rgba(255,179,71,0.4))' }}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kol-surface">
        {PLATFORM_OPTIONS.slice(0, 3).map((p) => (
          <img key={p.id} src={p.icon} alt={p.label} className="w-4 h-4 rounded-full" />
        ))}
      </div>
    </div>
  )
}

function CryptoTicker({
  icon,
  iconElement,
  price,
  color,
  label,
}: {
  icon?: string
  iconElement?: React.ReactNode
  price: number
  color: string
  label: string
}) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {iconElement ?? <img src={icon} alt={label} className="w-3.5 h-3.5" />}
      <span className="text-[12px] font-body" style={{ color }}>
        ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
    </div>
  )
}

export function Footer({
  solPrice,
  bnbPrice,
  isCoinsVisible,
  isFeedVisible,
  onToggleCoins,
  onToggleFeed,
}: FooterProps) {
  return (
    <div className="h-[36px] flex-shrink-0 border-t border-kol-border/50 bg-kol-bg/90 backdrop-blur-sm z-20 grid grid-cols-[1fr_auto_1fr] items-center px-2">
      {/* Left section */}
      <div className="flex items-center gap-1.5 justify-self-start col-start-1">
        <div className="hidden xs:block">
          <RegionDropdown />
        </div>

        <div className="flex items-center justify-center gap-1.5 p-1.5 xs:px-2 xs:py-0.5 rounded-md bg-kol-green/5 border border-kol-green/10 flex-shrink-0">
          <span className="w-[6px] h-[6px] rounded-full bg-kol-green flex-shrink-0" />
          <span className="text-[11px] text-kol-green font-body whitespace-nowrap hidden xs:inline lg:hidden">
            Connected
          </span>
          <span className="text-[11px] text-kol-green font-body whitespace-nowrap hidden lg:inline">
            Connection is stable
          </span>
        </div>

        <div className="hidden sm:block">
          <VerticalDivider />
        </div>

        {/* Crypto prices - hidden on small screens */}
        <div className="hidden sm:flex items-center gap-1.5">
          <CryptoTicker
            icon="/images/solanaLogoMark.svg"
            price={solPrice}
            color="#14F195"
            label="SOL"
          />
          {bnbPrice != null && (
            <CryptoTicker
              iconElement={<BnbIcon className="w-3.5 h-3.5" />}
              price={bnbPrice}
              color="#F0B90B"
              label="BNB"
            />
          )}
        </div>
      </div>

      {/* Center - platform pill with hover popover - hidden on small screens */}
      <div className="justify-self-center hidden md:block col-start-2">
        <MarketLighthousePopover>
          <PlatformPill />
        </MarketLighthousePopover>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-0.5 justify-self-end col-start-3">
        <QuickLinkPopover triggerMode="click" width={300} content={<FeesCardContent />}>
          <ExpandableButton icon="ri-percent-line" label="Fees" variant="subtle" />
        </QuickLinkPopover>
        <QuickLinkPopover triggerMode="click" width={260} content={<SoundCardContent />}>
          <ExpandableButton icon="ri-volume-up-line" label="Sound" variant="subtle" />
        </QuickLinkPopover>
        <QuickLinkPopover triggerMode="click" width={240} content={<LanguageCardContent />}>
          <ExpandableButton icon="ri-translate-2" label="Language" variant="subtle" />
        </QuickLinkPopover>
        <VerticalDivider />
        <ExpandableButton
          icon="ri-coin-line"
          label="Coins"
          variant="subtle"
          onClick={onToggleCoins}
          indicatorColor={isCoinsVisible ? '#00c46b' : undefined}
          className={isCoinsVisible ? 'opacity-100' : 'opacity-40'}
        />
        <ExpandableButton
          icon="ri-rss-line"
          label="Feed"
          variant="subtle"
          onClick={onToggleFeed}
          indicatorColor={isFeedVisible ? '#00c46b' : undefined}
          className={isFeedVisible ? 'opacity-100' : 'opacity-40'}
        />
        <VerticalDivider />
        <ExpandableButton
          icon="ri-discord-fill"
          label="Discord"
          variant="subtle"
          onClick={() => window.open('https://discord.gg/launchkol', '_blank')}
        />
        <ExpandableButton
          icon="ri-twitter-x-line"
          label="X"
          variant="subtle"
          onClick={() => window.open('https://x.com/launchkol', '_blank')}
        />
        <ExpandableButton
          icon="ri-file-text-line"
          label="Docs"
          variant="subtle"
          onClick={() => window.open('https://docs.launchkol.com', '_blank')}
        />
      </div>
    </div>
  )
}
