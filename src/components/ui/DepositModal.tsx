import { useState, useEffect, useCallback } from 'react'
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
// Network Tab Component
// ============================================================================

interface NetworkTabProps {
  network: NetworkConfig
  isActive: boolean
  onClick: () => void
}

function NetworkTab({ network, isActive, onClick }: NetworkTabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-between px-6 py-4 transition-colors
        ${isActive
          ? 'bg-kol-surface border-b-2 border-kol-blue'
          : 'bg-kol-surface/30 hover:bg-kol-surface/50 border-b-2 border-transparent'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <img
          src={network.icon}
          alt={network.symbol}
          className="w-6 h-6"
        />
        <span className="font-semibold text-white">{network.symbol}</span>
      </div>
      <div className="text-right">
        <div className="text-xs text-kol-text-muted">Balance:</div>
        <div className="font-semibold text-white">{network.balance.toFixed(2)} {network.symbol}</div>
      </div>
    </button>
  )
}

// ============================================================================
// QR Code with Logo
// ============================================================================

interface QRCodeWithLogoProps {
  value: string
  size?: number
}

function QRCodeWithLogo({ value, size = 150 }: QRCodeWithLogoProps) {
  return (
    <div className="relative bg-white p-1 rounded-lg flex-shrink-0">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        bgColor="#FFFFFF"
        fgColor="#000000"
      />
      {/* Center logo overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 rounded-md bg-kol-blue flex items-center justify-center shadow-lg">
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

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset to default when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveNetwork(defaultNetwork || networks[0]?.id)
      setCopied(false)
    }
  }, [isOpen, defaultNetwork, networks])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
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
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm"
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
            <div className="bg-kol-surface rounded-lg overflow-hidden border border-kol-border/50">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-kol-border/30">
                <h2 className="font-semibold text-white leading-none">Deposit</h2>
                <button
                  onClick={onClose}
                  className="rounded opacity-70 transition-opacity hover:opacity-100 flex-shrink-0"
                >
                  <i className="ri-close-line text-lg" />
                </button>
              </div>

              {/* Network Tabs */}
              <div className="flex border-b border-kol-border/30">
                {networks.map(network => (
                  <NetworkTab
                    key={network.id}
                    network={network}
                    isActive={activeNetwork === network.id}
                    onClick={() => setActiveNetwork(network.id)}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Description */}
                <p className="mb-4 text-sm text-kol-text-muted">
                  Deposit {currentNetwork.symbol} through the {currentNetwork.networkLabel} network for this address.
                </p>

                {/* QR Code and Address Container */}
                <div
                  className="p-4 rounded-lg border border-kol-border/50 bg-kol-surface-elevated/50 cursor-pointer hover:bg-kol-surface-elevated transition-colors relative"
                  onClick={handleCopy}
                >
                  <div className="flex gap-4">
                    {/* QR Code */}
                    <QRCodeWithLogo value={currentNetwork.address} size={150} />

                    {/* Address Info */}
                    <div className="flex-1">
                      <div className="text-sm text-kol-text-muted mb-2">Deposit Address</div>
                      <code className="block text-sm font-mono break-all text-white">
                        {currentNetwork.address}
                      </code>
                    </div>
                  </div>

                  {/* Copy Icon */}
                  <i className={`${copied ? 'ri-check-line text-kol-green' : 'ri-file-copy-line'} absolute bottom-3 right-3 text-sm opacity-40`} />
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
