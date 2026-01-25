import { useState, useCallback } from 'react'
import { BaseModal } from './BaseModal'
import { NetworkConfig } from './DepositModal'

// ============================================================================
// Types
// ============================================================================

export interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onDeposit: () => void
  onWithdraw?: () => void
  networks: NetworkConfig[]
  totalBalanceUsd: number
}

// ============================================================================
// Solana Logo SVG Component
// ============================================================================

function SolanaLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.44955 6.75999H12.0395C12.1595 6.75999 12.2695 6.80999 12.3595 6.89999L13.8795 8.45999C14.1595 8.74999 13.9595 9.23999 13.5595 9.23999H3.96955C3.84955 9.23999 3.73955 9.18999 3.64955 9.09999L2.12955 7.53999C1.84955 7.24999 2.04955 6.75999 2.44955 6.75999ZM2.12955 4.68999L3.64955 3.12999C3.72955 3.03999 3.84955 2.98999 3.96955 2.98999H13.5495C13.9495 2.98999 14.1495 3.47999 13.8695 3.76999L12.3595 5.32999C12.2795 5.41999 12.1595 5.46999 12.0395 5.46999H2.44955C2.04955 5.46999 1.84955 4.97999 2.12955 4.68999ZM13.8695 11.3L12.3495 12.86C12.2595 12.95 12.1495 13 12.0295 13H2.44955C2.04955 13 1.84955 12.51 2.12955 12.22L3.64955 10.66C3.72955 10.57 3.84955 10.52 3.96955 10.52H13.5495C13.9495 10.52 14.1495 11.01 13.8695 11.3Z"
        fill="url(#sol-gradient)"
      />
      <defs>
        <linearGradient id="sol-gradient" x1="1.77756" y1="13.3327" x2="13.9679" y2="1.14234" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" />
          <stop offset="0.24" stopColor="#8752F3" />
          <stop offset="0.465" stopColor="#5497D5" />
          <stop offset="0.6" stopColor="#43B4CA" />
          <stop offset="0.735" stopColor="#28E0B9" />
          <stop offset="1" stopColor="#19FB9B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ============================================================================
// BNB Logo SVG Component
// ============================================================================

function BnbLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.57583 9L3.58452 12.0945L6.29036 13.6418V15.4535L2.00097 13.0088V8.09508L3.57583 9ZM3.57583 5.90546V7.70873L2 6.80288V4.99961L3.57583 4.09375L5.15939 4.99961L3.57583 5.90546ZM7.42036 4.99961L8.9962 4.09375L10.5797 4.99961L8.9962 5.90546L7.42036 4.99961Z" fill="#F0B90B" />
      <path d="M4.71436 11.4531V9.64141L6.29019 10.5473V12.3505L4.71436 11.4531ZM7.4202 14.2907L8.99603 15.1966L10.5796 14.2907V16.094L8.99603 16.9998L7.4202 16.094V14.2907ZM12.8396 4.99961L14.4154 4.09375L15.999 4.99961V6.80288L14.4154 7.70873V5.90546L12.8396 4.99961ZM14.4154 12.0945L14.4241 9L15.9999 8.09414V13.0079L11.7106 15.4526V13.6409L14.4154 12.0945Z" fill="#F0B90B" />
      <path d="M13.2853 11.4543L11.7095 12.3517V10.5484L13.2853 9.64258V11.4543Z" fill="#F0B90B" />
      <path d="M13.2854 6.54672L13.2941 8.35843L10.5805 9.9057V13.0077L9.00471 13.9052L7.42888 13.0077V9.9057L4.71532 8.35843V6.54672L6.29791 5.64087L8.99506 7.19564L11.7086 5.64087L13.2922 6.54672H13.2854ZM4.71436 3.45312L8.99603 1L13.2854 3.45312L11.7096 4.35898L8.99603 2.80421L6.29019 4.35898L4.71436 3.45312Z" fill="#F0B90B" />
    </svg>
  )
}

// ============================================================================
// Copy Button Component
// ============================================================================

interface CopyButtonProps {
  label: string
  address: string
}

function CopyButton({ label, address }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [address])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-kol-text-muted/50 hover:text-kol-text-muted transition-colors"
    >
      <i className={`text-[10px] ${copied ? 'ri-check-line text-kol-green' : 'ri-file-copy-line'}`} />
      <span>{copied ? 'Copied' : label}</span>
    </button>
  )
}

// ============================================================================
// Main Wallet Modal Component
// ============================================================================

export function WalletModal({
  isOpen,
  onClose,
  onDeposit,
  onWithdraw,
  networks,
  totalBalanceUsd
}: WalletModalProps) {
  const solNetwork = networks.find(n => n.id === 'sol')
  const bnbNetwork = networks.find(n => n.id === 'bnb')

  const handleDeposit = () => {
    onClose()
    onDeposit()
  }

  const handleWithdraw = () => {
    if (onWithdraw) {
      onClose()
      onWithdraw()
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Wallet"
      icon="ri-wallet-3-line"
      width="w-[280px]"
    >
      {/* Balance Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-kol-text-muted/50">Balance</span>
        <div className="flex gap-3">
          {solNetwork && (
            <CopyButton label="Solana" address={solNetwork.address} />
          )}
          {bnbNetwork && (
            <CopyButton label="EVM" address={bnbNetwork.address} />
          )}
        </div>
      </div>

      {/* Total Balance USD */}
      <div className="text-lg font-semibold text-white mb-4">
        ${totalBalanceUsd.toFixed(2)}
      </div>

      {/* Swap Row */}
      <div className="py-3 border-t border-b border-kol-border flex items-center justify-between cursor-pointer hover:bg-kol-surface-elevated/30 -mx-4 px-4 transition-colors">
        {/* SOL Side */}
        <div className="flex items-center gap-2 w-1/3">
          <SolanaLogo className="w-4 h-4" />
          <span className="text-sm font-semibold text-white">
            {solNetwork?.balance.toFixed(2) ?? '0.00'}
          </span>
        </div>

        {/* Swap Icon */}
        <div className="flex items-center justify-center">
          <i className="ri-arrow-left-right-line text-kol-text-muted/50" />
        </div>

        {/* BNB Side */}
        <div className="flex items-center gap-2 w-1/3 justify-end">
          <span className="text-sm font-semibold text-white">
            {bnbNetwork?.balance.toFixed(2) ?? '0.00'}
          </span>
          <BnbLogo className="w-4 h-4" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={handleDeposit}
          className="h-8 rounded-md text-sm font-medium bg-kol-blue hover:bg-kol-blue-hover text-white transition-colors"
        >
          Deposit
        </button>
        <button
          onClick={handleWithdraw}
          disabled={!onWithdraw}
          className="h-8 rounded-md text-sm font-medium bg-kol-surface border border-kol-border hover:bg-kol-surface-elevated text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Withdraw
        </button>
      </div>
    </BaseModal>
  )
}

export default WalletModal
