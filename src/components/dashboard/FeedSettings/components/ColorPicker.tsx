import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Tooltip } from '../../../ui/Tooltip'
import { HIGHLIGHT_COLORS } from '../constants'

export interface ColorPickerProps {
  currentColor: string
  onSelect: (color: string) => void
}

export function ColorPicker({ currentColor, onSelect }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate dropdown position when opening (centered below swatch)
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const dropdownWidth = 4 * 28 + 2 * 8 + 3 * 4 // 4 cols * 28px + padding + gaps
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
        className="fixed p-2 bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] grid grid-cols-4 gap-1"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        {HIGHLIGHT_COLORS.map(({ color, label }) => (
          <Tooltip key={color} content={label} position="top">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelect(color)
                setIsOpen(false)
              }}
              className={`
                w-7 h-7 rounded-md flex items-center justify-center transition-all
                ${color === currentColor
                  ? 'ring-2 ring-white ring-offset-1 ring-offset-kol-bg'
                  : 'hover:scale-110'
                }
              `}
              style={{ backgroundColor: color }}
            />
          </Tooltip>
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
        className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 ring-1 ring-kol-border/50"
        style={{ backgroundColor: currentColor }}
      />
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
