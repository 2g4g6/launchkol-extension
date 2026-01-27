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

const PICKER_WIDTH = 280
const GRADIENT_SIZE = 140
const HUE_HEIGHT = 16
const SWATCH_SIZE = 24

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

  // Calculate dropdown position when opening
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popupWidth = 380 // Extension popup width

    // Position below the trigger, centered but clamped to popup bounds
    let left = rect.left + rect.width / 2 - PICKER_WIDTH / 2

    // Clamp to not overflow popup (8px padding)
    left = Math.max(8, Math.min(left, popupWidth - PICKER_WIDTH - 8))

    setDropdownPosition({
      top: rect.bottom + 6,
      left,
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

  // Handle close - save to recent and notify parent
  const handleClose = () => {
    const hex = hsvToHex(hsv)
    addRecentColor(hex)
    onSelect(hex)
    setIsOpen(false)
  }

  // Handle preset/recent color click
  const handleColorClick = (color: string) => {
    const parsed = hexToHsv(color)
    if (parsed) {
      setHsv(parsed)
      setHexInput(color.replace('#', '').toUpperCase())
      setHexInputError(false)
    }
    // Also immediately select and close
    addRecentColor(color)
    onSelect(color)
    setIsOpen(false)
  }

  // Current color from HSV
  const previewColor = hsvToHex(hsv)
  const hueColor = hsvToHex({ h: hsv.h, s: 100, v: 100 })

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-kol-bg border border-kol-border rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] z-[9999] overflow-hidden"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: PICKER_WIDTH,
        }}
      >
        {/* Preview Bar */}
        <div
          className="h-8 w-full"
          style={{ backgroundColor: previewColor }}
        />

        {/* Main content */}
        <div className="p-3 space-y-3">
          {/* Saturation/Brightness Gradient */}
          <div
            ref={gradientRef}
            className="relative rounded-lg cursor-crosshair overflow-hidden"
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
            <span className="text-kol-text-muted text-xs font-mono">#</span>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              maxLength={6}
              className={`
                flex-1 bg-kol-surface border rounded-lg px-2 py-1.5
                text-xs font-mono text-kol-text
                focus:outline-none focus:ring-1
                ${hexInputError
                  ? 'border-kol-red focus:ring-kol-red'
                  : 'border-kol-border focus:ring-kol-blue'
                }
              `}
              placeholder="FF5500"
            />
            {/* Preview swatch */}
            <div
              className="w-8 h-8 rounded-lg border border-kol-border"
              style={{ backgroundColor: previewColor }}
            />
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
                      rounded-md flex items-center justify-center transition-all
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
                      rounded-md flex items-center justify-center transition-all
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
      </Tooltip>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
