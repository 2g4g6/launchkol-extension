import { useEffect, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

// ============================================================================
// Types
// ============================================================================

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: string
  fullScreenMobile?: boolean
}

// ============================================================================
// Constants
// ============================================================================

const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const

// ============================================================================
// Base Modal Component
// ============================================================================

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  width = 'w-[390px]',
  fullScreenMobile = false
}: BaseModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Lock body scroll when open
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
            className={`${width} ${fullScreenMobile ? 'max-sm:w-full max-sm:h-full max-sm:max-w-full' : 'max-w-[95vw]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-kol-bg overflow-hidden border border-kol-border ${fullScreenMobile ? 'max-sm:h-full max-sm:rounded-none max-sm:border-0 rounded-lg' : 'rounded-lg'}`}>
              {/* Header */}
              <div className={`flex items-center justify-between px-4 py-3 border-b border-kol-border ${fullScreenMobile ? 'max-sm:py-4 max-sm:px-4' : ''}`}>
                <h2 className={`font-medium text-white text-sm ${fullScreenMobile ? 'max-sm:text-base' : ''}`}>{title}</h2>
                <button
                  onClick={onClose}
                  className={`rounded opacity-50 transition-opacity hover:opacity-100 ${fullScreenMobile ? 'max-sm:w-10 max-sm:h-10 max-sm:flex max-sm:items-center max-sm:justify-center max-sm:-mr-2' : ''}`}
                >
                  <i className={`ri-close-line text-base ${fullScreenMobile ? 'max-sm:text-xl' : ''}`} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

export default BaseModal
