import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'

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

export interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  networks: NetworkConfig[]
  defaultNetwork?: string
}

// ============================================================================
// Constants
// ============================================================================

const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const

// ============================================================================
// Network Dropdown Component
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
        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-kol-surface-elevated border border-kol-border/50 hover:border-kol-border transition-colors min-w-[200px]"
      >
        <img src={activeNetwork.icon} alt={activeNetwork.symbol} className="w-6 h-6" />
        <span className="font-semibold text-white">{activeNetwork.symbol}</span>
        <span className="text-sm text-kol-text-muted ml-auto">{activeNetwork.balance.toFixed(2)}</span>
        <i className={`ri-arrow-down-s-line text-kol-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden border border-kol-border/50 bg-kol-surface-elevated z-50"
          >
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  onSelect(network.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  network.id === activeNetwork.id
                    ? 'bg-kol-blue/10'
                    : 'hover:bg-kol-surface'
                }`}
              >
                <img src={network.icon} alt={network.symbol} className="w-5 h-5" />
                <span className="font-medium text-white">{network.symbol}</span>
                <span className="text-sm text-kol-text-muted ml-auto">{network.balance.toFixed(2)}</span>
                {network.id === activeNetwork.id && (
                  <i className="ri-check-line text-kol-blue" />
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
// QR Code with Logo
// ============================================================================

interface QRCodeWithLogoProps {
  value: string
  size?: number
}

function QRCodeWithLogo({ value, size = 160 }: QRCodeWithLogoProps) {
  return (
    <div className="relative bg-white p-2 rounded-lg">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        bgColor="#FFFFFF"
        fgColor="#000000"
      />
      {/* Center logo overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-9 h-9 rounded-lg bg-kol-blue flex items-center justify-center shadow-md">
          <span className="text-white font-display font-bold text-xs">LK</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Deposit Modal Component
// ============================================================================

export function DepositModal({ isOpen, onClose, networks, defaultNetwork }: DepositModalProps) {
  const [activeNetwork, setActiveNetwork] = useState(defaultNetwork || networks[0]?.id)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setActiveNetwork(defaultNetwork || networks[0]?.id)
      setCopied(false)
    }
  }, [isOpen, defaultNetwork, networks])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

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

  const currentNetwork = networks.find(n => n.id === activeNetwork) || networks[0]

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentNetwork.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [currentNetwork.address])

  // Truncate address for display
  const truncatedAddress = `${currentNetwork.address.slice(0, 14)}...${currentNetwork.address.slice(-10)}`

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70"
          onClick={onClose}
        >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: CUSTOM_EASE }}
            className="w-[380px] max-w-[95vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-kol-surface rounded-lg overflow-hidden border border-kol-border/50">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-kol-border/30">
                <h2 className="font-semibold text-white">Deposit</h2>
                <button
                  onClick={onClose}
                  className="rounded opacity-70 transition-opacity hover:opacity-100"
                >
                  <i className="ri-close-line text-lg" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Network Dropdown - Centered */}
                <div className="flex justify-center mb-5">
                  <NetworkDropdown
                    networks={networks}
                    activeNetwork={currentNetwork}
                    onSelect={setActiveNetwork}
                  />
                </div>

                {/* QR Code - Centered Hero */}
                <div className="flex justify-center mb-5">
                  <QRCodeWithLogo value={currentNetwork.address} size={160} />
                </div>

                {/* Address Container */}
                <div
                  className="p-4 rounded-lg border border-kol-border/50 bg-kol-surface-elevated/50 cursor-pointer hover:bg-kol-surface-elevated transition-colors"
                  onClick={handleCopy}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-kol-text-muted">Deposit Address</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs ${copied ? 'text-kol-green' : 'text-kol-text-muted'}`}>
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                      <i className={`${copied ? 'ri-check-line text-kol-green' : 'ri-file-copy-line text-kol-text-muted'} text-sm`} />
                    </div>
                  </div>
                  <code className="block text-sm font-mono text-white">
                    {truncatedAddress}
                  </code>
                </div>

                {/* Network hint */}
                <p className="text-center text-xs text-kol-text-muted mt-4">
                  Send only <span className="text-kol-blue font-medium">{currentNetwork.symbol}</span> via <span className="text-kol-blue font-medium">{currentNetwork.networkLabel}</span> network
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

export default DepositModal
