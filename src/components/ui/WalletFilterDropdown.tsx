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
  enabled: boolean
  nickname?: string
}

export interface WalletFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement | null>
  wallets: SavedWallet[]
  onAddWallet: (address: string) => void
  onRemoveWallet: (id: string) => void
  onToggleMode: (id: string) => void
  onToggleEnabled: (id: string) => void
  onSetNickname: (id: string, nickname: string) => void
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
// Wallet Row Component
// ============================================================================

function WalletRow({
  wallet,
  onToggleEnabled,
  onToggleMode,
  onSetNickname,
  onRemoveWallet,
}: {
  wallet: SavedWallet
  onToggleEnabled: (id: string) => void
  onToggleMode: (id: string) => void
  onSetNickname: (id: string, nickname: string) => void
  onRemoveWallet: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(wallet.nickname || '')
  const nicknameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      nicknameInputRef.current?.focus()
    }
  }, [editing])

  const saveNickname = () => {
    onSetNickname(wallet.id, editValue.trim())
    setEditing(false)
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-1.5 py-1.5 rounded-md hover:bg-white/[5%] group transition-opacity ${!wallet.enabled ? 'opacity-40' : ''}`}
    >
      {/* Enable/Disable Toggle */}
      <Tooltip content={wallet.enabled ? 'Disable filter' : 'Enable filter'} position="top" delayShow={200}>
        <button
          onClick={() => onToggleEnabled(wallet.id)}
          className="flex items-center justify-center w-5 h-5 flex-shrink-0 transition-colors"
        >
          {wallet.enabled ? (
            <i className="ri-toggle-fill text-base text-kol-blue" />
          ) : (
            <i className="ri-toggle-line text-base text-kol-text-muted" />
          )}
        </button>
      </Tooltip>

      {/* Nickname / Address */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={nicknameInputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveNickname}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                saveNickname()
              }
              if (e.key === 'Escape') {
                setEditValue(wallet.nickname || '')
                setEditing(false)
              }
            }}
            placeholder="Add nickname..."
            className="w-full h-5 px-1 rounded border border-kol-border bg-kol-surface text-xs text-white placeholder:text-kol-text-muted/50 focus:outline-none focus:border-kol-blue/50 transition-colors"
          />
        ) : (
          <Tooltip content="Click to edit nickname" position="top" delayShow={300}>
            <button
              onClick={() => {
                setEditValue(wallet.nickname || '')
                setEditing(true)
              }}
              className="text-left w-full truncate nickname-edit-btn group/nick"
            >
              {wallet.nickname ? (
                <div className="flex flex-col">
                  <span className="flex items-center gap-1">
                    <span className="text-xs text-white truncate group-hover/nick:underline group-hover/nick:decoration-kol-text-muted/40 group-hover/nick:underline-offset-2">{wallet.nickname}</span>
                    <i className="ri-pencil-line text-[10px] text-kol-text-muted opacity-0 group-hover/nick:opacity-100 transition-opacity flex-shrink-0" />
                  </span>
                  <span className="text-[10px] text-kol-text-muted truncate leading-tight">{truncateAddress(wallet.address)}</span>
                </div>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="text-xs text-kol-text-muted truncate group-hover/nick:underline group-hover/nick:decoration-kol-text-muted/40 group-hover/nick:underline-offset-2">
                    {truncateAddress(wallet.address)}
                  </span>
                  <i className="ri-pencil-line text-[10px] text-kol-text-muted opacity-0 group-hover/nick:opacity-100 transition-opacity flex-shrink-0" />
                </span>
              )}
            </button>
          </Tooltip>
        )}
      </div>

      {/* Whitelist/Blacklist Toggle */}
      <Tooltip content={wallet.mode === 'include' ? 'Whitelisted as dev wallet' : 'Blacklisted as dev wallet'} position="top" delayShow={200}>
        <button
          onClick={() => onToggleMode(wallet.id)}
          className="flex items-center gap-1 px-1.5 h-5 rounded transition-colors flex-shrink-0"
        >
          {wallet.mode === 'include' ? (
            <>
              <i className="ri-checkbox-circle-line text-sm text-kol-green" />
              <span className="text-[10px] text-kol-green font-medium">Whitelist</span>
            </>
          ) : (
            <>
              <i className="ri-close-circle-line text-sm text-kol-red" />
              <span className="text-[10px] text-kol-red font-medium">Blacklist</span>
            </>
          )}
        </button>
      </Tooltip>

      {/* Remove */}
      <div className="w-0 overflow-hidden group-hover:w-5 transition-all duration-150">
        <Tooltip content="Remove wallet" position="top" delayShow={200}>
          <button
            onClick={() => onRemoveWallet(wallet.id)}
            className="flex items-center justify-center w-5 h-5 rounded text-kol-text-muted hover:text-kol-red transition-colors"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
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
  onToggleEnabled,
  onSetNickname,
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
          className="fixed z-[10000] w-[280px] rounded-xl border border-kol-border bg-kol-bg shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.06] backdrop-blur-sm"
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
                <WalletRow
                  key={wallet.id}
                  wallet={wallet}
                  onToggleEnabled={onToggleEnabled}
                  onToggleMode={onToggleMode}
                  onSetNickname={onSetNickname}
                  onRemoveWallet={onRemoveWallet}
                />
              ))
            )}
          </div>

          {/* Add Section */}
          <div className="border-t border-kol-border/50 p-2">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <i className="ri-wallet-3-line absolute left-2 top-1/2 -translate-y-1/2 text-sm text-kol-text-muted/50" />
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
                  className="w-full h-7 pl-7 pr-2 rounded border border-kol-border bg-kol-surface text-xs text-white  placeholder:text-kol-text-muted/50 focus:outline-none focus:border-kol-blue/50 transition-colors"
                />
              </div>
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
