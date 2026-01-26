import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { PumpLogo, BonkLogo, BagsLogo, RaydiumLogo, FourMemeLogo, BinanceLogo, PlatformLogoMap, PlatformType } from './PlatformLogos'

// ============================================================================
// Types
// ============================================================================

export interface TokenResult {
  address: string
  name: string
  ticker: string
  image?: string
  platform: PlatformType
  age: string
  marketCap: string
  volume: string
  liquidity: string
  twitterUrl?: string
  websiteUrl?: string
  telegramUrl?: string
  creatorWallet?: string
}

export interface SearchTokensModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken: (token: TokenResult) => void
  userWalletAddress?: string
}

// ============================================================================
// Constants
// ============================================================================

const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const

type PlatformFilter = 'all' | PlatformType
type SortOption = 'time' | 'trending' | 'volume' | 'liquidity'

const PLATFORM_FILTERS: { id: PlatformFilter; label: string; Logo?: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All' },
  { id: 'pump', label: 'Pump', Logo: PumpLogo },
  { id: 'bonk', label: 'Bonk', Logo: BonkLogo },
  { id: 'bags', label: 'Bags', Logo: BagsLogo },
  { id: 'raydium', label: 'Ray', Logo: RaydiumLogo },
  { id: 'fourmeme', label: 'Four', Logo: FourMemeLogo },
  { id: 'binance', label: 'BNB', Logo: BinanceLogo },
]

const SORT_OPTIONS: { id: SortOption; icon: string; label: string }[] = [
  { id: 'time', icon: 'ri-time-line', label: 'Recent' },
  { id: 'trending', icon: 'ri-fire-line', label: 'Trending' },
  { id: 'volume', icon: 'ri-bar-chart-line', label: 'Volume' },
  { id: 'liquidity', icon: 'ri-drop-line', label: 'Liquidity' },
]

// Platform badge colors
const PLATFORM_COLORS: Record<PlatformType, string> = {
  pump: 'bg-green-500/20 border-green-500/50',
  bonk: 'bg-orange-500/20 border-orange-500/50',
  bags: 'bg-purple-500/20 border-purple-500/50',
  raydium: 'bg-cyan-500/20 border-cyan-500/50',
  fourmeme: 'bg-pink-500/20 border-pink-500/50',
  binance: 'bg-yellow-500/20 border-yellow-500/50',
}

// Mock data for demonstration
const MOCK_TOKENS: TokenResult[] = [
  {
    address: 'CBvno2t3bFRHpV3YoyuhA2eLaQ42WwUDE4a7d3C1xkSm',
    name: 'hello world',
    ticker: 'HELLO',
    platform: 'pump',
    age: '24m',
    marketCap: '$4K',
    volume: '$3K',
    liquidity: '$8K',
    twitterUrl: 'https://twitter.com',
    websiteUrl: 'https://example.com',
    creatorWallet: '43HPNeS2FroDxUGRQKV1iNDrYFD1wo5rPVj5Qc9igLZN',
  },
  {
    address: '7dNW2mhCtqoZcDuyRbj5LMoeFsS9TpaCdSkk4qMstGPm',
    name: 'Hello Kitty',
    ticker: 'KITTY',
    platform: 'raydium',
    age: '3mo',
    marketCap: '$146K',
    volume: '$142',
    liquidity: '$61K',
    twitterUrl: 'https://twitter.com',
    creatorWallet: 'DifferentWallet123456789012345678901234567890',
  },
  {
    address: 'HsRtbRWaB29bPg6wESHz61y6VYbZvJJzoreGuqTupfM9',
    name: 'Hello Kitty',
    ticker: 'KITTY',
    platform: 'pump',
    age: '8mo',
    marketCap: '$65K',
    volume: '$128',
    liquidity: '$50K',
    websiteUrl: 'https://example.com',
    creatorWallet: '43HPNeS2FroDxUGRQKV1iNDrYFD1wo5rPVj5Qc9igLZN',
  },
  {
    address: 'FourMeme123456789012345678901234567890ABCD',
    name: 'Four Meme Token',
    ticker: 'FOUR',
    platform: 'fourmeme',
    age: '2d',
    marketCap: '$12K',
    volume: '$5K',
    liquidity: '$15K',
    creatorWallet: 'AnotherWallet12345678901234567890123456789012',
  },
  {
    address: 'BnbToken123456789012345678901234567890EFGH',
    name: 'BNB Meme',
    ticker: 'BNBM',
    platform: 'binance',
    age: '1w',
    marketCap: '$85K',
    volume: '$2K',
    liquidity: '$40K',
    creatorWallet: 'BnbCreator12345678901234567890123456789012345',
  },
]

// ============================================================================
// Helper Components
// ============================================================================

function PlatformBadge({ platform }: { platform: PlatformType }) {
  const LogoComponent = PlatformLogoMap[platform]
  const colorClass = PLATFORM_COLORS[platform]

  return (
    <div
      className={`absolute -bottom-0.5 -right-0.5 sm:bottom-0 sm:right-0 h-[14px] w-[14px] sm:h-4 sm:w-4 rounded-full bg-kol-bg shadow-sm z-10 flex items-center justify-center border ${colorClass}`}
    >
      <LogoComponent className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
    </div>
  )
}

function TokenAvatar({ token }: { token: TokenResult }) {
  return (
    <div className="relative h-11 w-11 sm:h-[62px] sm:w-[62px] flex-shrink-0">
      <div className="h-full w-full rounded-[4px] border border-kol-border bg-kol-surface overflow-hidden">
        {token.image ? (
          <img
            src={token.image}
            alt={token.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm sm:text-base font-bold text-kol-text-muted">
            {token.ticker.slice(0, 2)}
          </div>
        )}
      </div>
      <PlatformBadge platform={token.platform} />
    </div>
  )
}

function TokenRow({
  token,
  isSelected,
  onClick
}: {
  token: TokenResult
  isSelected?: boolean
  onClick: () => void
}) {
  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(token.address)
  }

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 h-16 sm:h-[88px] cursor-pointer transition-colors
        ${isSelected ? 'bg-kol-surface-elevated' : 'hover:bg-white/[7%]'}
      `}
    >
      <TokenAvatar token={token} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-base font-medium text-white truncate max-w-[80px] sm:max-w-none tracking-[-0.02em]">
            {token.ticker}
          </span>
          <button
            onClick={copyAddress}
            className="flex items-center gap-1 text-xs sm:text-base text-kol-text-muted hover:text-kol-blue transition-colors"
          >
            <span className="truncate max-w-[48px] sm:max-w-[150px] font-medium tracking-[-0.02em]">{token.name}</span>
            <i className="ri-file-copy-line text-xs sm:text-sm" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs sm:text-sm font-medium text-kol-green">{token.age}</span>

          {token.twitterUrl && (
            <a
              href={token.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-kol-text-muted hover:text-kol-blue transition-colors"
            >
              <i className="ri-user-line text-xs sm:text-base" />
            </a>
          )}

          {token.websiteUrl && (
            <a
              href={token.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-kol-text-muted hover:text-kol-blue transition-colors"
            >
              <i className="ri-global-line text-xs sm:text-base" />
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-end gap-1">
          <span className="text-[10px] sm:text-xs text-kol-text-muted pb-[1.6px]">MC</span>
          <span className="text-xs sm:text-base text-white font-medium">{token.marketCap}</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-[10px] sm:text-xs text-kol-text-muted pb-[1.6px]">V</span>
          <span className="text-xs sm:text-base text-white font-medium">{token.volume}</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-[10px] sm:text-xs text-kol-text-muted pb-[1.6px]">L</span>
          <span className="text-xs sm:text-base text-white font-medium">{token.liquidity}</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className="hidden sm:flex h-[30px] w-[30px] items-center justify-center rounded-full bg-kol-blue hover:bg-kol-blue-hover transition-colors"
      >
        <i className="ri-flashlight-fill text-base text-black" />
      </button>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function SearchTokensModal({
  isOpen,
  onClose,
  onSelectToken,
}: SearchTokensModalProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('time')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const filterScrollRef = useRef<HTMLDivElement>(null)

  // Check if filters can scroll
  const checkScrollable = () => {
    if (filterScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = filterScrollRef.current
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }

  const scrollFiltersRight = () => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: 100, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check scroll on mount and resize
  useEffect(() => {
    if (isOpen) {
      setTimeout(checkScrollable, 100)
      window.addEventListener('resize', checkScrollable)
      return () => window.removeEventListener('resize', checkScrollable)
    }
  }, [isOpen])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Filter tokens based on search and platform
  const filteredTokens = MOCK_TOKENS.filter((token) => {
    const matchesSearch =
      searchQuery === '' ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatform =
      platformFilter === 'all' || token.platform === platformFilter

    return matchesSearch && matchesPlatform
  })

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredTokens.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && filteredTokens[selectedIndex]) {
        onSelectToken(filteredTokens[selectedIndex])
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredTokens, onClose, onSelectToken])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9998] flex items-start sm:items-center justify-center bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: CUSTOM_EASE }}
            className="w-[calc(100%-8px)] sm:w-[640px] h-[480px] sm:h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-kol-bg rounded-lg overflow-hidden border border-kol-border shadow-[0_4px_4px_0_rgba(0,0,0,0.30),0_8px_8px_0_rgba(0,0,0,0.45)] flex flex-col h-full">
              {/* Filters Row - Platform filters left, Sort icons right */}
              <div className="flex items-center justify-between gap-4 px-4 pl-3 pt-3">
                {/* Platform Filters - scrollable */}
                <div className="relative flex-1 min-w-0 overflow-hidden">
                  <div
                    ref={filterScrollRef}
                    onScroll={checkScrollable}
                    className="flex items-center gap-2 overflow-x-auto scrollbar-hide -ml-2 pl-2 pr-0"
                  >
                    {PLATFORM_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setPlatformFilter(filter.id)}
                        className={`
                          flex h-6 flex-shrink-0 items-center gap-[3px] px-1 rounded text-xs font-medium whitespace-nowrap transition-colors border
                          ${platformFilter === filter.id
                            ? 'bg-kol-blue/15 text-kol-blue border-kol-blue/50'
                            : 'bg-kol-surface/45 border-kol-border text-kol-text-muted hover:bg-kol-surface-elevated'
                          }
                        `}
                      >
                        {filter.Logo && <filter.Logo className="w-3 h-3" />}
                        <span className="font-medium">{filter.label}</span>
                      </button>
                    ))}
                  </div>
                  {/* Scroll arrow with gradient */}
                  {canScrollRight && (
                    <div className="absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-kol-bg to-transparent pointer-events-none flex items-center justify-end">
                      <button
                        type="button"
                        onClick={scrollFiltersRight}
                        className="pointer-events-auto flex items-center justify-center w-6 h-6 text-kol-text-muted hover:text-white transition-colors"
                      >
                        <i className="ri-arrow-right-s-line text-xl" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sort Icons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-kol-text-muted">Sort by</span>
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      title={option.label}
                      className={`
                        h-6 w-6 flex items-center justify-center rounded transition-colors
                        ${sortBy === option.id
                          ? 'bg-kol-blue/15 text-kol-blue'
                          : 'text-kol-text-muted hover:bg-kol-surface-elevated'
                        }
                      `}
                    >
                      <i className={`${option.icon} text-sm`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <div className="flex h-16 items-center gap-2 px-4 border-b border-kol-border/50">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ticker, or CA..."
                  className="flex-1 bg-transparent text-xl text-white placeholder:text-xl placeholder:text-kol-text-muted outline-none"
                />
                <button
                  onClick={onClose}
                  className="flex h-5 items-center px-2 rounded-full border border-kol-border bg-kol-surface text-xs text-white hover:bg-kol-surface-elevated transition-colors"
                >
                  Esc
                </button>
              </div>

              {/* Results Header */}
              <div className="flex h-10 items-center justify-between px-4 pr-2">
                <span className="text-xs text-kol-text-secondary">
                  {filteredTokens.length > 0 ? `${filteredTokens.length} Results` : 'History'}
                </span>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((token, index) => (
                    <TokenRow
                      key={token.address}
                      token={token}
                      isSelected={index === selectedIndex}
                      onClick={() => {
                        onSelectToken(token)
                        onClose()
                      }}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-kol-text-muted">
                    <i className="ri-search-line text-3xl mb-2 opacity-50" />
                    <p className="text-sm">No tokens found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

export default SearchTokensModal
