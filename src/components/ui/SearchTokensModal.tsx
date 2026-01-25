import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { PumpLogo, BonkLogo, BagsLogo, RaydiumLogo, FourMemeLogo, BinanceLogo, PlatformLogoMap, PlatformType } from './PlatformLogos'
import { CreatorFilterModal, CreatorFilter } from './CreatorFilterModal'

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
      className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-kol-bg shadow-sm z-10 flex items-center justify-center border ${colorClass}`}
    >
      <LogoComponent className="w-2.5 h-2.5" />
    </div>
  )
}

function TokenAvatar({ token }: { token: TokenResult }) {
  return (
    <div className="relative h-10 w-10 flex-shrink-0">
      <div className="h-full w-full rounded-lg border border-kol-border bg-kol-surface overflow-hidden">
        {token.image ? (
          <img
            src={token.image}
            alt={token.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm font-bold text-kol-text-muted">
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
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(token.address)
  }

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors
        ${isSelected ? 'bg-kol-surface-elevated' : 'hover:bg-kol-surface'}
      `}
    >
      <TokenAvatar token={token} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-white truncate max-w-[100px]">
            {token.ticker}
          </span>
          <span className="text-xs text-kol-text-muted truncate max-w-[80px]">
            {token.name}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <button
            onClick={copyAddress}
            className="flex items-center gap-1 text-xs text-kol-text-muted hover:text-kol-blue transition-colors"
          >
            <span className="font-mono">{truncateAddress(token.address)}</span>
            <i className="ri-file-copy-line text-[10px]" />
          </button>

          <span className="text-xs font-medium text-kol-green">{token.age}</span>

          {token.twitterUrl && (
            <a
              href={token.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-kol-text-muted hover:text-kol-blue transition-colors"
            >
              <i className="ri-twitter-x-line text-xs" />
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
              <i className="ri-global-line text-xs" />
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="text-right">
          <span className="text-kol-text-muted">MC </span>
          <span className="text-white font-medium">{token.marketCap}</span>
        </div>
        <div className="text-right">
          <span className="text-kol-text-muted">V </span>
          <span className="text-white font-medium">{token.volume}</span>
        </div>
        <div className="text-right">
          <span className="text-kol-text-muted">L </span>
          <span className="text-white font-medium">{token.liquidity}</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className="h-7 w-7 flex items-center justify-center rounded-full bg-kol-blue hover:bg-kol-blue-hover transition-colors"
      >
        <i className="ri-flashlight-fill text-sm text-black" />
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
  userWalletAddress,
}: SearchTokensModalProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('time')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [creatorFilter, setCreatorFilter] = useState<CreatorFilter>({ mode: 'any' })
  const [isCreatorFilterOpen, setIsCreatorFilterOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      setCreatorFilter({ mode: 'any' })
    }
  }, [isOpen])

  // Filter tokens based on search, platform, and creator
  const filteredTokens = MOCK_TOKENS.filter((token) => {
    const matchesSearch =
      searchQuery === '' ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatform =
      platformFilter === 'all' || token.platform === platformFilter

    const matchesCreator =
      creatorFilter.mode === 'any' ||
      (creatorFilter.mode === 'my-wallet' && token.creatorWallet === userWalletAddress) ||
      (creatorFilter.mode === 'custom' && token.creatorWallet === creatorFilter.customAddress)

    return matchesSearch && matchesPlatform && matchesCreator
  })

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isCreatorFilterOpen) return

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
  }, [isOpen, isCreatorFilterOpen, selectedIndex, filteredTokens, onClose, onSelectToken])

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

  const isCreatorFilterActive = creatorFilter.mode !== 'any'

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9998] flex items-start justify-center pt-4 bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: CUSTOM_EASE }}
            className="w-[480px] max-h-[500px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-kol-bg rounded-lg overflow-hidden border border-kol-border shadow-2xl flex flex-col max-h-[500px]">
              {/* Filters Row */}
              <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
                  {PLATFORM_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setPlatformFilter(filter.id)}
                      className={`
                        flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors
                        ${platformFilter === filter.id
                          ? 'bg-kol-blue/20 text-kol-blue border border-kol-blue/50'
                          : 'bg-kol-surface border border-kol-border text-kol-text-muted hover:bg-kol-surface-elevated'
                        }
                      `}
                    >
                      {filter.Logo && <filter.Logo className="w-3 h-3" />}
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      title={option.label}
                      className={`
                        h-6 w-6 flex items-center justify-center rounded transition-colors
                        ${sortBy === option.id
                          ? 'bg-kol-blue/20 text-kol-blue'
                          : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
                        }
                      `}
                    >
                      <i className={`${option.icon} text-sm`} />
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="w-px h-4 bg-kol-border mx-1" />

                  {/* Creator Filter Button */}
                  <button
                    onClick={() => setIsCreatorFilterOpen(true)}
                    title="Filter by creator"
                    className={`
                      h-6 w-6 flex items-center justify-center rounded transition-colors
                      ${isCreatorFilterActive
                        ? 'bg-kol-blue/20 text-kol-blue'
                        : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
                      }
                    `}
                  >
                    <i className="ri-user-settings-line text-sm" />
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div className="flex items-center gap-2 px-3 py-3 border-y border-kol-border/50">
                <i className="ri-search-line text-kol-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ticker, or CA..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-kol-text-muted outline-none"
                />
                <button
                  onClick={onClose}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-kol-border bg-kol-surface text-xs text-kol-text-muted hover:bg-kol-surface-elevated transition-colors"
                >
                  Esc
                </button>
              </div>

              {/* Results Header */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-kol-text-muted">
                  {filteredTokens.length} Results
                </span>
                {isCreatorFilterActive && (
                  <button
                    onClick={() => setCreatorFilter({ mode: 'any' })}
                    className="flex items-center gap-1 text-xs text-kol-blue hover:text-kol-blue-hover transition-colors"
                  >
                    <i className="ri-filter-off-line text-sm" />
                    Clear creator filter
                  </button>
                )}
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto min-h-0">
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

          {/* Creator Filter Modal */}
          <CreatorFilterModal
            isOpen={isCreatorFilterOpen}
            onClose={() => setIsCreatorFilterOpen(false)}
            currentFilter={creatorFilter}
            onApply={setCreatorFilter}
            userWalletAddress={userWalletAddress}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

export default SearchTokensModal
