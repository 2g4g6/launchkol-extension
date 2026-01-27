import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { PLATFORM_OPTIONS } from '../constants'
import type { PlatformType } from '../types'

export interface PlatformSelectProps {
  value: PlatformType
  onChange: (value: PlatformType) => void
  disabled?: boolean
  showDefault?: boolean
  defaultLabel?: string
}

export function PlatformSelect({ value, onChange, disabled, showDefault, defaultLabel }: PlatformSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = PLATFORM_OPTIONS.find(p => p.id === value) || PLATFORM_OPTIONS[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 140),
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
        className="fixed bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] py-1"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left, minWidth: dropdownPosition.width }}
      >
        {showDefault && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 max-sm:py-3 text-left text-xs max-sm:text-sm text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white transition-colors"
          >
            Default {defaultLabel && <span className="text-kol-text-muted/60">({defaultLabel})</span>}
          </button>
        )}
        {PLATFORM_OPTIONS.map(platform => (
          <button
            key={platform.id}
            onClick={(e) => {
              e.stopPropagation()
              onChange(platform.id)
              setIsOpen(false)
            }}
            className={`
              w-full px-3 py-2 max-sm:py-3 text-left text-xs max-sm:text-sm transition-colors flex items-center gap-2
              ${platform.id === value
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
              }
            `}
          >
            <img src={platform.icon} className="w-4 h-4 max-sm:w-5 max-sm:h-5 flex-shrink-0" alt="" />
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
          if (!disabled) setIsOpen(!isOpen)
        }}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-2 h-8 max-sm:h-11 px-3 rounded-lg bg-kol-surface/50 border text-xs max-sm:text-sm transition-colors
          ${isOpen ? 'border-kol-blue/50' : 'border-kol-border/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-kol-border'}
        `}
      >
        <div className="flex items-center gap-2">
          <img src={selectedOption.icon} className="w-4 h-4 max-sm:w-5 max-sm:h-5 flex-shrink-0" alt="" />
          <span className="text-white">{selectedOption.label}</span>
        </div>
        <i className={`ri-arrow-down-s-line text-kol-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
