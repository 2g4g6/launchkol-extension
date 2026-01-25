import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseModal } from './BaseModal'

// ============================================================================
// Types
// ============================================================================

export interface NetworkConfig {
  id: string
  name: string
  symbol: string
  icon: string
  balance: number
  address: string
  networkLabel: string
}

export interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  networks: NetworkConfig[]
  defaultNetwork?: string
  solPrice?: number
  onWithdraw?: (recipient: string, amount: number, networkId: string) => void
}

// ============================================================================
// Network Pill Dropdown Component
// ============================================================================

interface NetworkDropdownProps {
  networks: NetworkConfig[]
  activeNetwork: NetworkConfig
  onSelect: (id: string) => void
}

function NetworkDropdown({ networks, activeNetwork, onSelect }: NetworkDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-kol-surface border border-kol-border hover:border-kol-border/80 transition-colors"
      >
        <img src={activeNetwork.icon} alt={activeNetwork.symbol} className="w-4 h-4" />
        <span className="font-medium text-white text-xs">{activeNetwork.symbol}</span>
        <span className="text-xs text-kol-text-muted">{activeNetwork.balance.toFixed(2)}</span>
        <i className={`ri-arrow-down-s-line text-kol-text-muted text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 rounded-lg overflow-hidden border border-kol-border bg-kol-surface z-50"
          >
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  onSelect(network.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 transition-colors ${
                  network.id === activeNetwork.id
                    ? 'bg-kol-surface-elevated'
                    : 'hover:bg-kol-surface-elevated/50'
                }`}
              >
                <img src={network.icon} alt={network.symbol} className="w-4 h-4" />
                <span className="font-medium text-white text-xs">{network.symbol}</span>
                <span className="text-xs text-kol-text-muted ml-auto">{network.balance.toFixed(2)}</span>
                {network.id === activeNetwork.id && (
                  <i className="ri-check-line text-kol-blue text-xs" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Main Withdraw Modal Component
// ============================================================================

export function WithdrawModal({
  isOpen,
  onClose,
  networks,
  defaultNetwork,
  solPrice = 150,
  onWithdraw
}: WithdrawModalProps) {
  const [activeNetwork, setActiveNetwork] = useState(defaultNetwork || networks[0]?.id)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setActiveNetwork(defaultNetwork || networks[0]?.id)
      setRecipient('')
      setAmount('')
      setIsSubmitting(false)
    }
  }, [isOpen, defaultNetwork, networks])

  const currentNetwork = networks.find(n => n.id === activeNetwork) || networks[0]

  const amountNum = parseFloat(amount) || 0
  const usdValue = amountNum * solPrice
  const isValidAmount = amountNum > 0 && amountNum <= currentNetwork.balance

  // Different validation for different networks
  const isValidRecipient = currentNetwork.id === 'sol'
    ? recipient.length >= 32 && recipient.length <= 44 // Solana addresses
    : recipient.length === 42 && recipient.startsWith('0x') // EVM addresses

  const hasInvalidRecipient = recipient.length > 0 && !isValidRecipient

  const handleMax = useCallback(() => {
    setAmount(currentNetwork.balance.toFixed(6))
  }, [currentNetwork.balance])

  const handleSubmit = useCallback(async () => {
    if (!isValidAmount || !isValidRecipient || !onWithdraw) return

    setIsSubmitting(true)
    try {
      await onWithdraw(recipient, amountNum, currentNetwork.id)
      onClose()
    } catch (error) {
      console.error('Withdraw failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [isValidAmount, isValidRecipient, onWithdraw, recipient, amountNum, currentNetwork.id, onClose])

  const getButtonText = () => {
    if (isSubmitting) return 'Processing...'
    if (!recipient) return 'Enter recipient address'
    if (!isValidRecipient) return 'Invalid recipient address'
    if (!amount || amountNum === 0) return 'Enter amount'
    if (amountNum > currentNetwork.balance) return 'Insufficient balance'
    return 'Withdraw'
  }

  const isButtonDisabled = !isValidAmount || !isValidRecipient || isSubmitting

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw"
      icon="ri-arrow-up-line"
    >
      {/* Network Pill Dropdown - Centered */}
      <div className="flex justify-center mb-4">
        <NetworkDropdown
          networks={networks}
          activeNetwork={currentNetwork}
          onSelect={setActiveNetwork}
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Recipient Address Field */}
        <div className="space-y-2">
          <label
            htmlFor="recipient"
            className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium"
          >
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient address"
            className={`w-full h-12 px-3 rounded-md border bg-kol-surface text-white text-sm placeholder:text-kol-text-muted/50 focus:outline-none transition-colors ${
              hasInvalidRecipient
                ? 'border-kol-red focus:border-kol-red focus:ring-1 focus:ring-kol-red/30'
                : 'border-kol-border focus:border-kol-blue/50 focus:ring-1 focus:ring-kol-blue/30'
            }`}
          />
        </div>

        {/* Amount Field */}
        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium"
          >
            Withdraw Amount
          </label>
          <div className="relative">
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              className="w-full h-16 px-3 pr-28 rounded-md border border-kol-border bg-kol-surface text-white text-2xl font-medium placeholder:text-kol-text-muted/50 focus:outline-none focus:border-kol-blue/50 focus:ring-1 focus:ring-kol-blue/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={handleMax}
                className="text-kol-blue text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                Max
              </button>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-kol-surface-elevated/50">
                <img src={currentNetwork.icon} alt={currentNetwork.symbol} className="w-4 h-4" />
                <span className="text-sm font-semibold text-white">{currentNetwork.symbol}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-kol-text-muted">
            <span>${usdValue.toFixed(2)}</span>
            <span>Available: {currentNetwork.balance.toFixed(6)} {currentNetwork.symbol}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`w-full h-12 rounded-md text-base font-semibold transition-colors ${
            isButtonDisabled
              ? 'bg-kol-surface border border-kol-border text-white opacity-50 cursor-not-allowed'
              : 'bg-kol-blue hover:bg-kol-blue-hover text-white'
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    </BaseModal>
  )
}

export default WithdrawModal
