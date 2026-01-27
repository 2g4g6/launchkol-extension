import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Tooltip } from '../../../ui/Tooltip'
import { HIGHLIGHT_COLORS } from '../constants'
import { useRecentColors } from '../hooks/useRecentColors'
import { hexToHsv, hsvToHex, type HSV } from './colorUtils'

export interface ColorPickerProps {
  currentColor: string
  onSelect: (color: string) => void
}

const PICKER_WIDTH = 264
const GRADIENT_SIZE = 120
const HUE_HEIGHT = 14
const SWATCH_SIZE = 24

const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const

export function ColorPicker({ currentColor, onSelect }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  // HSV state for the picker
  const [hsv, setHsv] = useState<HSV>({ h: 210, s: 100, v: 100 })
  const [hexInput, setHexInput] = useState('')
  const [hexInputError, setHexInputError] = useState(false)

  // Dragging state
  const [isDraggingGradient, setIsDraggingGradient] = useState(false)
  const [isDraggingHue, setIsDraggingHue] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const gradientRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  const { recentColors, addRecentColor } = useRecentColors()

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize HSV from currentColor when opening
  useEffect(() => {
    if (isOpen) {
      const parsed = hexToHsv(currentColor)
      if (parsed) {
        setHsv(parsed)
        setHexInput(currentColor.replace('#', '').toUpperCase())
        setHexInputError(false)
      }
    }
  }, [isOpen, currentColor])

  // Calculate dropdown position - ABOVE the trigger
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const estimatedHeight = 340 // Approximate picker height

    // Position ABOVE the trigger, centered horizontally
    let left = triggerRect.left + triggerRect.width / 2 - PICKER_WIDTH / 2
    let top = triggerRect.top - estimatedHeight - 8

    // Clamp to viewport bounds (8px padding)
    if (left < 8) {
      left = 8
    } else if (left + PICKER_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - PICKER_WIDTH - 8
    }

    // If not enough room above, position below instead
    if (top < 8) {
      top = triggerRect.bottom + 8
    }

    setDropdownPosition({ top, left })
  }, [])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        handleClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
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

  // Live update: call onSelect whenever HSV changes
  useEffect(() => {
    if (isOpen) {
      const hex = hsvToHex(hsv)
      onSelect(hex)
    }
  }, [hsv, isOpen, onSelect])

  // Handle gradient drag
  const handleGradientInteraction = useCallback((clientX: number, clientY: number) => {
    if (!gradientRef.current) return
    const rect = gradientRef.current.getBoundingClientRect()

    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height))

    const s = (x / rect.width) * 100
    const v = 100 - (y / rect.height) * 100

    setHsv(prev => ({ ...prev, s, v }))
  }, [])

  // Handle hue drag
  const handleHueInteraction = useCallback((clientX: number) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()

    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const h = (x / rect.width) * 360

    setHsv(prev => ({ ...prev, h }))
  }, [])

  // Mouse event handlers for gradient
  useEffect(() => {
    if (!isDraggingGradient) return

    const handleMouseMove = (e: MouseEvent) => {
      handleGradientInteraction(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      setIsDraggingGradient(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingGradient, handleGradientInteraction])

  // Mouse event handlers for hue
  useEffect(() => {
    if (!isDraggingHue) return

    const handleMouseMove = (e: MouseEvent) => {
      handleHueInteraction(e.clientX)
    }

    const handleMouseUp = () => {
      setIsDraggingHue(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingHue, handleHueInteraction])

  // Update hex input when HSV changes (from dragging)
  useEffect(() => {
    if (!isDraggingGradient && !isDraggingHue) return
    const hex = hsvToHex(hsv).replace('#', '').toUpperCase()
    setHexInput(hex)
    setHexInputError(false)
  }, [hsv, isDraggingGradient, isDraggingHue])

  // Handle hex input change
  const handleHexChange = (value: string) => {
    // Remove # if user types it
    const clean = value.replace('#', '').toUpperCase()
    setHexInput(clean)

    // Only allow hex characters
    if (!/^[0-9A-F]*$/.test(clean)) {
      setHexInputError(true)
      return
    }

    // Try to parse when we have 3 or 6 characters
    if (clean.length === 3 || clean.length === 6) {
      const parsed = hexToHsv('#' + clean)
      if (parsed) {
        setHsv(parsed)
        setHexInputError(false)
      } else {
        setHexInputError(true)
      }
    } else if (clean.length > 6) {
      setHexInputError(true)
    } else {
      setHexInputError(false)
    }
  }

  // Handle close - save to recent colors
  const handleClose = () => {
    const hex = hsvToHex(hsv)
    addRecentColor(hex)
    setIsOpen(false)
  }

  // Handle preset/recent color click - update live
  const handleColorClick = (color: string) => {
    const parsed = hexToHsv(color)
    if (parsed) {
      setHsv(parsed)
      setHexInput(color.replace('#', '').toUpperCase())
      setHexInputError(false)
    }
  }

  // Current color from HSV
  const previewColor = hsvToHex(hsv)
  const hueColor = hsvToHex({ h: hsv.h, s: 100, v: 100 })

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15, ease: CUSTOM_EASE }}
        className="fixed bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.5)] z-[9999] overflow-hidden"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: PICKER_WIDTH,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-kol-border">
          <span className="text-xs font-medium text-white">Pick Color</span>
          <button
            onClick={handleClose}
            className="rounded opacity-50 transition-opacity hover:opacity-100"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        {/* Main content */}
        <div className="p-3 space-y-3">
          {/* Saturation/Brightness Gradient */}
          <div
            ref={gradientRef}
            className="relative rounded-md cursor-crosshair overflow-hidden"
            style={{
              height: GRADIENT_SIZE,
              background: `
                linear-gradient(to bottom, transparent, black),
                linear-gradient(to right, white, ${hueColor})
              `,
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              setIsDraggingGradient(true)
              handleGradientInteraction(e.clientX, e.clientY)
            }}
          >
            {/* Picker indicator */}
            <motion.div
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.5)] pointer-events-none"
              style={{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: previewColor,
              }}
              animate={isDraggingGradient ? {} : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>

          {/* Hue Slider */}
          <div
            ref={hueRef}
            className="relative rounded-full cursor-pointer overflow-hidden"
            style={{
              height: HUE_HEIGHT,
              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              setIsDraggingHue(true)
              handleHueInteraction(e.clientX)
            }}
          >
            {/* Hue indicator */}
            <motion.div
              className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.5)] pointer-events-none"
              style={{
                left: `${(hsv.h / 360) * 100}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: hueColor,
              }}
              animate={isDraggingHue ? {} : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>

          {/* Hex Input */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md border border-kol-border shrink-0"
              style={{ backgroundColor: previewColor }}
            />
            <div className="flex items-center flex-1 bg-kol-surface border border-kol-border rounded-md overflow-hidden">
              <span className="text-kol-text-muted text-xs font-mono pl-2">#</span>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                maxLength={6}
                className={`
                  flex-1 bg-transparent px-1 py-1.5
                  text-xs font-mono text-kol-text
                  focus:outline-none
                  ${hexInputError ? 'text-kol-red' : ''}
                `}
                placeholder="FF5500"
              />
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <div className="text-[10px] text-kol-text-muted uppercase tracking-wide mb-1.5">Presets</div>
            <div className="flex flex-wrap gap-1.5">
              {HIGHLIGHT_COLORS.map(({ color, label }) => (
                <Tooltip key={color} content={label} position="top">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleColorClick(color)
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      rounded-md transition-all
                      ${color.toLowerCase() === previewColor.toLowerCase()
                        ? 'ring-2 ring-white ring-offset-1 ring-offset-kol-bg'
                        : ''
                      }
                    `}
                    style={{
                      backgroundColor: color,
                      width: SWATCH_SIZE,
                      height: SWATCH_SIZE,
                    }}
                  />
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Recent Colors */}
          {recentColors.length > 0 && (
            <div>
              <div className="text-[10px] text-kol-text-muted uppercase tracking-wide mb-1.5">Recent</div>
              <div className="flex flex-wrap gap-1.5">
                {recentColors.map((color) => (
                  <motion.button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleColorClick(color)
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      rounded-md transition-all
                      ${color.toLowerCase() === previewColor.toLowerCase()
                        ? 'ring-2 ring-white ring-offset-1 ring-offset-kol-bg'
                        : ''
                      }
                    `}
                    style={{
                      backgroundColor: color,
                      width: SWATCH_SIZE,
                      height: SWATCH_SIZE,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <Tooltip content="Pick color" position="top">
        <div className="inline-flex">
          <button
            ref={triggerRef}
            onClick={(e) => {
              e.stopPropagation()
              if (isOpen) {
                handleClose()
              } else {
                setIsOpen(true)
              }
            }}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 ring-1 ring-kol-border/50 group relative"
            style={{ backgroundColor: currentColor }}
          >
            {/* Paint brush icon on hover */}
            <i className="ri-palette-line text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          </button>
        </div>
      </Tooltip>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
