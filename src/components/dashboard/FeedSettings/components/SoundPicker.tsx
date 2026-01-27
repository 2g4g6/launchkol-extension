import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { NOTIFICATION_SOUNDS } from '../constants'

export interface SoundPickerProps {
  currentSound: string
  onSelect: (soundId: string) => void
  enabled: boolean
}

export function SoundPicker({ currentSound, onSelect, enabled }: SoundPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
        className="fixed bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] py-1 min-w-[120px]"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        {NOTIFICATION_SOUNDS.map(sound => (
          <button
            key={sound.id}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(sound.id)
              setIsOpen(false)
            }}
            className={`
              w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center gap-2
              ${sound.id === currentSound
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
              }
            `}
          >
            <i className={sound.icon} />
            {sound.label}
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
          if (enabled) setIsOpen(!isOpen)
        }}
        disabled={!enabled}
        className={`
          flex items-center gap-1 h-6 px-1.5 rounded text-xs transition-colors
          ${enabled
            ? 'text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated'
            : 'text-kol-text-muted/40 cursor-not-allowed'
          }
        `}
      >
        <i className={NOTIFICATION_SOUNDS.find(s => s.id === currentSound)?.icon || 'ri-volume-up-line'} />
        <i className={`ri-arrow-down-s-line text-[10px] ${isOpen ? 'rotate-180' : ''} transition-transform`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
