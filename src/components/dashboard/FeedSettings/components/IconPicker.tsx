import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { GROUP_ICONS } from '../constants'

export interface IconPickerProps {
  currentIcon: string
  onSelect: (icon: string) => void
}

export function IconPicker({ currentIcon, onSelect }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate dropdown position when opening (centered below icon)
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const dropdownWidth = 5 * 28 + 2 * 8 + 4 * 4 // 5 cols * 28px + padding + gaps
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left + rect.width / 2 - dropdownWidth / 2,
    })
  }, [])

  // Click outside to close
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

  // Update position when open
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
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed p-2 bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] grid grid-cols-5 gap-1"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        {GROUP_ICONS.map(icon => (
          <button
            key={icon}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(icon)
              setIsOpen(false)
            }}
            className={`
              w-7 h-7 rounded flex items-center justify-center transition-colors
              ${icon === currentIcon
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'hover:bg-kol-surface-elevated text-kol-text-muted hover:text-white'
              }
            `}
          >
            <i className={`${icon} text-sm`} />
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
        className="w-6 h-6 rounded flex items-center justify-center hover:bg-kol-surface-elevated transition-colors flex-shrink-0"
      >
        <i className={`${currentIcon} text-sm text-kol-text-muted`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
