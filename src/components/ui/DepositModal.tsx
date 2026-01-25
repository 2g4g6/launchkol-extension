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
    <motion.button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-3 rounded-lg transition-all
        ${isActive
          ? 'bg-kol-surface-elevated border border-kol-border'
          : 'bg-transparent border border-transparent hover:bg-kol-surface/50'
        }
      `}
      whileTap={{ scale: 0.98 }}
    >
      {/* Network icon */}
      <img
        src={network.icon}
        alt={network.symbol}
        className="w-5 h-5"
      />

      {/* Network symbol */}
      <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-kol-text-muted'}`}>
        {network.symbol}
      </span>

      {/* Balance */}
      <div className="flex flex-col items-end ml-auto">
        <span className="text-[10px] text-kol-text-muted">Balance:</span>
        <span className={`text-xs font-mono ${isActive ? 'text-white' : 'text-kol-text-muted'}`}>
          {network.balance.toFixed(2)} {network.symbol}
        </span>
      </div>
    </motion.button>
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
    <div className="relative bg-white p-3 rounded-xl">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        bgColor="#FFFFFF"
        fgColor="#000000"
      />
      {/* Center logo overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-10 h-10 rounded-lg bg-kol-blue flex items-center justify-center shadow-lg">
          <span className="text-white font-display font-bold text-sm">LK</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Copy Button
// ============================================================================

interface CopyButtonProps {
  text: string
}

function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [text])

  return (
    <motion.button
      onClick={handleCopy}
      className="p-2 rounded-lg bg-kol-surface hover:bg-kol-surface-elevated border border-kol-border/50 hover:border-kol-border transition-all"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <i className={`${copied ? 'ri-check-line text-kol-green' : 'ri-file-copy-line text-kol-text-muted'} text-base`} />
    </motion.button>
  )
}

// ============================================================================
// Main Deposit Modal Component
// ============================================================================

export function DepositModal({ isOpen, onClose, networks, defaultNetwork }: DepositModalProps) {
  const [activeNetwork, setActiveNetwork] = useState(defaultNetwork || networks[0]?.id)
  const [mounted, setMounted] = useState(false)

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset to default when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveNetwork(defaultNetwork || networks[0]?.id)
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

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: CUSTOM_EASE }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[420px] max-w-[95vw]"
          >
            <div
              className="relative bg-[#0d0d10] border border-kol-border/50 rounded-2xl overflow-hidden"
              style={{
                boxShadow: `
                  0 25px 50px -12px rgba(0, 0, 0, 0.8),
                  0 0 0 1px rgba(255, 255, 255, 0.03) inset,
                  0 1px 0 rgba(255, 255, 255, 0.05) inset
                `,
              }}
            >
              {/* Subtle glow effect */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 123, 255, 0.3) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />

              {/* Header */}
              <div className="relative flex items-center justify-between px-5 py-4 border-b border-kol-border/30">
                <h2 className="text-lg font-display font-semibold text-white">
                  Deposit
                </h2>
                <motion.button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-kol-surface transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className="ri-close-line text-xl text-kol-text-muted hover:text-white transition-colors" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="relative p-5">
                {/* Network Tabs */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {networks.map(network => (
                    <NetworkTab
                      key={network.id}
                      network={network}
                      isActive={activeNetwork === network.id}
                      onClick={() => setActiveNetwork(network.id)}
                    />
                  ))}
                </div>

                {/* Description */}
                <p className="text-sm text-kol-text-muted mb-5">
                  Deposit {currentNetwork.symbol} through the {currentNetwork.networkLabel} network for this address.
                </p>

                {/* QR Code and Address Section */}
                <div className="flex gap-5">
                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    <QRCodeWithLogo value={currentNetwork.address} size={140} />
                  </div>

                  {/* Address Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xs text-kol-text-muted mb-2 font-medium">
                      Deposit Address
                    </p>
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-white font-mono break-all leading-relaxed flex-1">
                        {currentNetwork.address}
                      </p>
                      <CopyButton text={currentNetwork.address} />
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="mt-5 p-3 rounded-lg bg-kol-surface/50 border border-kol-border/30">
                  <div className="flex items-start gap-2">
                    <i className="ri-error-warning-line text-yellow-500 text-sm mt-0.5" />
                    <p className="text-xs text-kol-text-muted leading-relaxed">
                      Only send {currentNetwork.symbol} to this address. Sending any other asset may result in permanent loss.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

export default DepositModal
