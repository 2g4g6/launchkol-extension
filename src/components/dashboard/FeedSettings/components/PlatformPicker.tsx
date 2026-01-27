import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { PLATFORM_OPTIONS } from '../constants'

export interface PlatformPickerProps {
  currentPlatform: string | null
  onSelect: (platform: string | null) => void
  accountDefault?: string
}

export function PlatformPicker({ currentPlatform, onSelect, accountDefault }: PlatformPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedPlatform = currentPlatform
    ? PLATFORM_OPTIONS.find(p => p.id === currentPlatform)
    : null

  const displayLabel = selectedPlatform?.label || 'Default'

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] py-1 min-w-[100px]"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        {/* Default option */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect(null)
            setIsOpen(false)
          }}
          className={`
            w-full px-3 py-1.5 text-left text-xs transition-colors
            ${currentPlatform === null
              ? 'bg-kol-blue/15 text-kol-blue'
              : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
            }
          `}
        >
          Default {accountDefault && <span className="text-kol-text-muted/60">({accountDefault})</span>}
        </button>
        {PLATFORM_OPTIONS.map(platform => (
          <button
            key={platform.id}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(platform.id)
              setIsOpen(false)
            }}
            className={`
              w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center gap-2
              ${platform.id === currentPlatform
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
              }
            `}
          >
            <img src={platform.icon} className="w-3.5 h-3.5 flex-shrink-0" alt="" />
            <span>{platform.label}</span>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-1.5 h-6 px-1.5 rounded text-xs text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated transition-colors"
      >
        {selectedPlatform && <img src={selectedPlatform.icon} className="w-3.5 h-3.5 flex-shrink-0" alt="" />}
        <span className="max-w-[60px] truncate">{displayLabel}</span>
        <i className={`ri-arrow-down-s-line text-[10px] ${isOpen ? 'rotate-180' : ''} transition-transform`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
