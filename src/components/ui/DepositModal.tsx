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
// Segmented Control Component
// ============================================================================

interface SegmentedControlProps {
  networks: NetworkConfig[]
  activeNetwork: string
  onSelect: (id: string) => void
}

function SegmentedControl({ networks, activeNetwork, onSelect }: SegmentedControlProps) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-kol-bg/50 border border-kol-border/30">
      {networks.map((network) => {
        const isActive = activeNetwork === network.id
        return (
          <motion.button
            key={network.id}
            onClick={() => onSelect(network.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${isActive ? 'text-white' : 'text-kol-text-muted hover:text-kol-text-secondary'}
            `}
            whileTap={{ scale: 0.97 }}
          >
            {isActive && (
              <motion.div
                layoutId="activeSegment"
                className="absolute inset-0 bg-kol-surface-elevated border border-kol-border/50 rounded-lg"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03) inset',
                }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <img
              src={network.icon}
              alt={network.symbol}
              className="w-5 h-5 relative z-10"
            />
            <span className="relative z-10">{network.symbol}</span>
          </motion.button>
        )
      })}
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

function QRCodeWithLogo({ value, size = 180 }: QRCodeWithLogoProps) {
  return (
    <motion.div
      className="relative bg-white p-3 rounded-2xl shadow-2xl"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3, ease: CUSTOM_EASE }}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        bgColor="#FFFFFF"
        fgColor="#000000"
      />
      {/* Center logo overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-10 h-10 rounded-xl bg-kol-blue flex items-center justify-center"
          style={{
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)',
          }}
        >
          <span className="text-white font-display font-bold text-sm">LK</span>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Address Pill Component
// ============================================================================

interface AddressPillProps {
  address: string
  onCopy: () => void
  copied: boolean
}

function AddressPill({ address, onCopy, copied }: AddressPillProps) {
  // Truncate address for display
  const truncated = `${address.slice(0, 8)}...${address.slice(-8)}`

  return (
    <motion.button
      onClick={onCopy}
      className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-kol-surface/50 border border-kol-border/30 hover:border-kol-blue/30 transition-all w-full max-w-[320px]"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl bg-kol-blue/0 group-hover:bg-kol-blue/5 transition-colors" />

      <code className="relative z-10 text-sm font-mono text-white flex-1 text-left">
        {truncated}
      </code>

      <div className="relative z-10 flex items-center gap-2">
        <span className="text-xs text-kol-text-muted group-hover:text-kol-text-secondary transition-colors">
          {copied ? 'Copied!' : 'Copy'}
        </span>
        <i className={`${copied ? 'ri-check-line text-kol-green' : 'ri-file-copy-line text-kol-text-muted group-hover:text-kol-blue'} text-base transition-colors`} />
      </div>
    </motion.button>
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
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm"
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
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(16, 16, 16, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: `
                  0 25px 50px -12px rgba(0, 0, 0, 0.8),
                  0 0 0 1px rgba(255, 255, 255, 0.03) inset,
                  0 1px 0 rgba(255, 255, 255, 0.05) inset
                `,
              }}
            >
              {/* Top highlight line */}
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                }}
              />

              {/* Gradient orb accent */}
              <div
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full opacity-40 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 123, 255, 0.3) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />

              {/* Header */}
              <div className="relative flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-display font-semibold text-white">Deposit</h2>
                <motion.button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-kol-surface/50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className="ri-close-line text-xl text-kol-text-muted hover:text-white transition-colors" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="relative px-5 pb-6">
                {/* Network Selector */}
                <div className="flex justify-center mb-6">
                  <SegmentedControl
                    networks={networks}
                    activeNetwork={activeNetwork}
                    onSelect={setActiveNetwork}
                  />
                </div>

                {/* QR Code - Hero */}
                <div className="flex justify-center mb-5">
                  <QRCodeWithLogo value={currentNetwork.address} size={180} />
                </div>

                {/* Balance */}
                <div className="text-center mb-5">
                  <span className="text-sm text-kol-text-muted">
                    Available: <span className="text-white font-semibold">{currentNetwork.balance.toFixed(4)} {currentNetwork.symbol}</span>
                  </span>
                </div>

                {/* Address Pill */}
                <div className="flex justify-center">
                  <AddressPill
                    address={currentNetwork.address}
                    onCopy={handleCopy}
                    copied={copied}
                  />
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
