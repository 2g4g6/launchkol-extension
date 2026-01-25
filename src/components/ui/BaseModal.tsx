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
  width = 'w-[390px]'
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
            className={`${width} max-w-[95vw]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-kol-bg rounded-lg overflow-hidden border border-kol-border">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-kol-border">
                <h2 className="font-medium text-white text-sm">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded opacity-50 transition-opacity hover:opacity-100"
                >
                  <i className="ri-close-line text-base" />
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
