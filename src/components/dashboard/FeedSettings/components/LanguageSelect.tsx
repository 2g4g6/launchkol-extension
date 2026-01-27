import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

export interface LanguageSelectProps {
  value: string
  onChange: (value: string) => void
  options: { code: string; label: string }[]
  disabled?: boolean
}

export function LanguageSelect({ value, onChange, options, disabled }: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.code === value) || options[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
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
        className="fixed bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] py-1 max-h-[200px] overflow-y-auto scrollbar-styled"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
      >
        {options.map(option => (
          <button
            key={option.code}
            onClick={(e) => {
              e.stopPropagation()
              onChange(option.code)
              setIsOpen(false)
            }}
            className={`
              w-full px-3 py-2 text-left text-xs transition-colors
              ${option.code === value
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
              }
            `}
          >
            {option.label}
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
          flex items-center justify-between w-full h-8 px-3 rounded-lg bg-kol-surface/50 border text-xs transition-colors
          ${isOpen ? 'border-kol-blue/50' : 'border-kol-border/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-kol-border'}
        `}
      >
        <span className="text-white">{selectedOption.label}</span>
        <i className={`ri-arrow-down-s-line text-kol-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
