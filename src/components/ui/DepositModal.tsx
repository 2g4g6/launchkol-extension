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
// QR Code with Network Icon
// ============================================================================

interface QRCodeWithLogoProps {
  value: string
  size?: number
  networkIcon: string
  networkSymbol: string
}

function QRCodeWithLogo({ value, size = 120, networkIcon, networkSymbol }: QRCodeWithLogoProps) {
  return (
    <div className="relative bg-white p-1 rounded-md flex-shrink-0">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        bgColor="#FFFFFF"
        fgColor="#000000"
      />
      {/* Center network icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
          <img src={networkIcon} alt={networkSymbol} className="w-5 h-5" />
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
            className="w-[420px] max-w-[95vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-kol-bg rounded-lg overflow-hidden border border-kol-border">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-kol-border">
                <h2 className="font-medium text-white text-sm">Deposit</h2>
                <button
                  onClick={onClose}
                  className="rounded opacity-50 transition-opacity hover:opacity-100"
                >
                  <i className="ri-close-line text-base" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Network Pill Dropdown - Centered */}
                <div className="flex justify-center mb-4">
                  <NetworkDropdown
                    networks={networks}
                    activeNetwork={currentNetwork}
                    onSelect={setActiveNetwork}
                  />
                </div>

                {/* QR Code + Address Container */}
                <div
                  className="relative p-3 rounded-md border border-kol-border bg-kol-surface cursor-pointer hover:bg-kol-surface-elevated/50 transition-colors"
                  onClick={handleCopy}
                >
                  <div className="flex gap-3">
                    {/* QR Code */}
                    <QRCodeWithLogo
                      value={currentNetwork.address}
                      size={120}
                      networkIcon={currentNetwork.icon}
                      networkSymbol={currentNetwork.symbol}
                    />

                    {/* Address */}
                    <div className="flex-1 pt-1">
                      <div className="text-xs text-kol-text-muted mb-1.5">Deposit Address</div>
                      <code className="block text-xs font-mono break-all text-kol-text-muted/70 leading-relaxed">
                        {currentNetwork.address}
                      </code>
                    </div>
                  </div>

                  {/* Copy Icon */}
                  <i className={`absolute bottom-2.5 right-2.5 text-xs opacity-40 ${copied ? 'ri-check-line text-kol-green opacity-100' : 'ri-file-copy-line'}`} />
                </div>
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
