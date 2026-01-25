import { useState, useEffect } from 'react'
import { BaseModal } from './BaseModal'

// ============================================================================
// Types
// ============================================================================

export type CreatorFilterMode = 'any' | 'my-wallet' | 'custom'

export interface CreatorFilter {
  mode: CreatorFilterMode
  customAddress?: string
}

export interface CreatorFilterModalProps {
  isOpen: boolean
  onClose: () => void
  currentFilter: CreatorFilter
  onApply: (filter: CreatorFilter) => void
  userWalletAddress?: string
}

// ============================================================================
// Helper Components
// ============================================================================

interface FilterOptionProps {
  label: string
  description: string
  icon: string
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}

function FilterOption({
  label,
  description,
  icon,
  isSelected,
  onSelect,
  disabled = false,
}: FilterOptionProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left
        ${isSelected
          ? 'border-kol-blue bg-kol-blue/10'
          : 'border-kol-border hover:border-kol-border-hover hover:bg-kol-surface'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Radio indicator */}
      <div
        className={`
          mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
          ${isSelected ? 'border-kol-blue' : 'border-kol-text-muted'}
        `}
      >
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-kol-blue" />
        )}
      </div>

      {/* Icon */}
      <i className={`${icon} text-lg ${isSelected ? 'text-kol-blue' : 'text-kol-text-muted'}`} />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-kol-text-secondary'}`}>
          {label}
        </p>
        <p className="text-xs text-kol-text-muted mt-0.5">
          {description}
        </p>
      </div>
    </button>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function CreatorFilterModal({
  isOpen,
  onClose,
  currentFilter,
  onApply,
  userWalletAddress,
}: CreatorFilterModalProps) {
  const [mode, setMode] = useState<CreatorFilterMode>(currentFilter.mode)
  const [customAddress, setCustomAddress] = useState(currentFilter.customAddress || '')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(currentFilter.mode)
      setCustomAddress(currentFilter.customAddress || '')
    }
  }, [isOpen, currentFilter])

  // Address validation (Solana: 32-44 characters, base58)
  const isValidSolanaAddress = (address: string) => {
    return address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)
  }

  const showAddressError = mode === 'custom' && customAddress.length > 0 && !isValidSolanaAddress(customAddress)

  const canApply =
    mode === 'any' ||
    (mode === 'my-wallet' && userWalletAddress) ||
    (mode === 'custom' && isValidSolanaAddress(customAddress))

  const handleApply = () => {
    onApply({
      mode,
      customAddress: mode === 'custom' ? customAddress : undefined,
    })
    onClose()
  }

  const truncateAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter by Creator"
      width="w-[360px]"
    >
      <div className="space-y-3">
        {/* Any Wallet Option */}
        <FilterOption
          label="Any wallet"
          description="Show tokens from all creators"
          icon="ri-global-line"
          isSelected={mode === 'any'}
          onSelect={() => setMode('any')}
        />

        {/* My Wallet Option */}
        <FilterOption
          label="My wallet"
          description={userWalletAddress ? truncateAddress(userWalletAddress) : 'Not connected'}
          icon="ri-wallet-3-line"
          isSelected={mode === 'my-wallet'}
          onSelect={() => setMode('my-wallet')}
          disabled={!userWalletAddress}
        />

        {/* Custom Wallet Option */}
        <FilterOption
          label="Custom wallet"
          description="Enter a specific wallet address"
          icon="ri-search-line"
          isSelected={mode === 'custom'}
          onSelect={() => setMode('custom')}
        />

        {/* Custom Address Input (shown when custom is selected) */}
        {mode === 'custom' && (
          <div className="pl-7">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="Enter Solana wallet address"
              className={`
                w-full h-10 px-3 rounded-md border bg-kol-surface text-white text-sm font-mono
                placeholder:text-kol-text-muted/50 focus:outline-none transition-colors
                ${showAddressError
                  ? 'border-kol-red focus:border-kol-red focus:ring-1 focus:ring-kol-red/30'
                  : 'border-kol-border focus:border-kol-blue/50 focus:ring-1 focus:ring-kol-blue/30'
                }
              `}
            />
            {showAddressError && (
              <p className="text-xs text-kol-red mt-1.5 flex items-center gap-1">
                <i className="ri-error-warning-line" />
                Invalid Solana address
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={onClose}
          className="flex-1 h-10 rounded-md text-sm font-medium bg-kol-surface border border-kol-border hover:bg-kol-surface-elevated text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={!canApply}
          className={`
            flex-1 h-10 rounded-md text-sm font-semibold transition-colors
            ${canApply
              ? 'bg-kol-blue hover:bg-kol-blue-hover text-white'
              : 'bg-kol-surface border border-kol-border text-white opacity-50 cursor-not-allowed'
            }
          `}
        >
          Apply Filter
        </button>
      </div>
    </BaseModal>
  )
}

export default CreatorFilterModal
