import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Tooltip } from './Tooltip'

// ============================================================================
// Types
// ============================================================================

export type WalletFilterMode = 'include' | 'exclude'

export interface SavedWallet {
  id: string
  address: string
  mode: WalletFilterMode
}

export interface WalletFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement | null>
  wallets: SavedWallet[]
  onAddWallet: (address: string) => void
  onRemoveWallet: (id: string) => void
  onToggleMode: (id: string) => void
}

// ============================================================================
// Helpers
// ============================================================================

const isValidSolanaAddress = (address: string) => {
  return address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)
}

const truncateAddress = (addr: string) => {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// ============================================================================
// Main Component
// ============================================================================

export function WalletFilterDropdown({
  isOpen,
  onClose,
  triggerRef,
  wallets,
  onAddWallet,
  onRemoveWallet,
  onToggleMode,
}: WalletFilterDropdownProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const DROPDOWN_WIDTH = 280

  // Position state - null until calculated so we can hide until ready
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate dropdown position - BELOW the trigger, centered horizontally
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()

    // Guard: if trigger hasn't laid out yet, skip
    if (triggerRect.width === 0 && triggerRect.height === 0) return

    // Position BELOW the trigger, centered horizontally
    let left = triggerRect.left + triggerRect.width / 2 - DROPDOWN_WIDTH / 2
    const top = triggerRect.bottom + 8

    // Clamp to viewport bounds (8px padding)
    if (left < 8) {
      left = 8
    } else if (left + DROPDOWN_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - DROPDOWN_WIDTH - 8
    }

    setPosition({ top, left })
  }, [triggerRef])

  // Update position when open, and on scroll/resize
  useEffect(() => {
    if (isOpen) {
      // Use rAF to ensure the trigger button has rendered in the DOM
      requestAnimationFrame(() => {
        updatePosition()
      })
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    } else {
      setPosition(null)
    }
  }, [isOpen, updatePosition])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setInputValue('')
      setError('')
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [isOpen, onClose, triggerRef])

  const handleAdd = () => {
    const address = inputValue.trim()

    if (!address) return

    if (!isValidSolanaAddress(address)) {
      setError('Invalid Solana address')
      return
    }

    if (wallets.some((w) => w.address === address)) {
      setError('Wallet already added')
      return
    }

    onAddWallet(address)
    setInputValue('')
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  if (!mounted) return null

  const dropdown = (
    <AnimatePresence>
      {isOpen && position && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[10000] w-[280px] rounded-lg border border-kol-border bg-kol-bg shadow-[0_4px_4px_0_rgba(0,0,0,0.30),0_8px_8px_0_rgba(0,0,0,0.45)]"
          style={{ top: position.top, left: position.left }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <span className="text-xs font-semibold text-white">Wallet Filter</span>
            <span className="text-[10px] text-kol-text-muted">{wallets.length} saved</span>
          </div>

          {/* Wallet List */}
          <div className="max-h-[240px] overflow-y-auto px-1.5">
            {wallets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-kol-text-muted">
                <i className="ri-wallet-3-line text-2xl mb-1 opacity-50" />
                <p className="text-xs">No wallet filters</p>
              </div>
            ) : (
              wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center gap-2 px-1.5 py-1.5 rounded-md hover:bg-white/[5%] group"
                >
                  {/* Address */}
                  <span className="flex-1 text-xs  text-kol-text-muted truncate">
                    {truncateAddress(wallet.address)}
                  </span>

                  {/* Include/Exclude Toggle */}
                  <Tooltip content={wallet.mode === 'include' ? 'Click to exclude' : 'Click to include'} position="top" delayShow={200}>
                    <button
                      onClick={() => onToggleMode(wallet.id)}
                      className="flex items-center gap-1 px-1.5 h-5 rounded transition-colors"
                    >
                      {wallet.mode === 'include' ? (
                        <>
                          <i className="ri-checkbox-circle-line text-sm text-kol-green" />
                          <span className="text-[10px] text-kol-green font-medium">Include</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-close-circle-line text-sm text-kol-red" />
                          <span className="text-[10px] text-kol-red font-medium">Exclude</span>
                        </>
                      )}
                    </button>
                  </Tooltip>

                  {/* Remove */}
                  <Tooltip content="Remove wallet" position="top" delayShow={200}>
                    <button
                      onClick={() => onRemoveWallet(wallet.id)}
                      className="flex items-center justify-center w-5 h-5 rounded text-kol-text-muted hover:text-kol-red transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <i className="ri-close-line text-sm" />
                    </button>
                  </Tooltip>
                </div>
              ))
            )}
          </div>

          {/* Add Section */}
          <div className="border-t border-kol-border/50 p-2">
            <div className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setError('')
                }}
                onKeyDown={handleKeyDown}
                placeholder="Wallet address..."
                className="flex-1 h-7 px-2 rounded border border-kol-border bg-kol-surface text-xs text-white  placeholder:text-kol-text-muted/50 focus:outline-none focus:border-kol-blue/50 transition-colors min-w-0"
              />
              <button
                onClick={handleAdd}
                disabled={!inputValue.trim()}
                className={`
                  h-7 px-2.5 rounded text-xs font-medium transition-colors flex-shrink-0
                  ${inputValue.trim()
                    ? 'bg-kol-blue hover:bg-kol-blue-hover text-white'
                    : 'bg-kol-surface border border-kol-border text-kol-text-muted cursor-not-allowed'
                  }
                `}
              >
                Add
              </button>
            </div>
            {error && (
              <p className="text-[10px] text-kol-red mt-1 px-0.5 flex items-center gap-0.5">
                <i className="ri-error-warning-line" />
                {error}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(dropdown, document.body)
}

export default WalletFilterDropdown
