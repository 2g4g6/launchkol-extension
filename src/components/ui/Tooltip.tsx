import {
  useState,
  useRef,
  useEffect,
  useCallback,
  cloneElement,
  ReactNode,
  ReactElement,
  useId,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

// ============================================================================
// Types
// ============================================================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'
export type TooltipAlign = 'start' | 'center' | 'end'

export interface TooltipProps {
  /** Content to display inside the tooltip */
  content: ReactNode
  /** The element that triggers the tooltip */
  children: ReactElement
  /** Preferred position - will auto-flip if no space */
  position?: TooltipPosition
  /** Alignment along the position axis */
  align?: TooltipAlign
  /** Delay before showing (ms) */
  delayShow?: number
  /** Delay before hiding (ms) */
  delayHide?: number
  /** Maximum width before text wraps */
  maxWidth?: number
  /** Disable the tooltip entirely */
  disabled?: boolean
  /** Show arrow pointer */
  showArrow?: boolean
  /** Custom offset from trigger element (px) */
  offset?: number
  /** Additional className for tooltip container */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const
const DEFAULT_OFFSET = 10
const ARROW_SIZE = 6
const VIEWPORT_PADDING = 12

// ============================================================================
// Position Calculation
// ============================================================================

interface Coords {
  x: number
  y: number
}

interface PositionResult {
  finalPosition: TooltipPosition
  coords: Coords
  arrowOffset: number
}

function calculatePosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  preferredPosition: TooltipPosition,
  align: TooltipAlign,
  offset: number,
  viewport: { width: number; height: number }
): PositionResult {
  const gap = offset + ARROW_SIZE

  // Calculate base positions for each direction
  const positions: Record<TooltipPosition, Coords> = {
    top: {
      x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      y: triggerRect.top - tooltipRect.height - gap,
    },
    bottom: {
      x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      y: triggerRect.bottom + gap,
    },
    left: {
      x: triggerRect.left - tooltipRect.width - gap,
      y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
    },
    right: {
      x: triggerRect.right + gap,
      y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
    },
  }

  // Apply alignment adjustments
  if (align !== 'center') {
    if (preferredPosition === 'top' || preferredPosition === 'bottom') {
      if (align === 'start') {
        positions[preferredPosition].x = triggerRect.left
      } else if (align === 'end') {
        positions[preferredPosition].x =
          triggerRect.right - tooltipRect.width
      }
    } else {
      if (align === 'start') {
        positions[preferredPosition].y = triggerRect.top
      } else if (align === 'end') {
        positions[preferredPosition].y =
          triggerRect.bottom - tooltipRect.height
      }
    }
  }

  // Check if position fits in viewport
  const fitsInViewport = (pos: TooltipPosition): boolean => {
    const coords = positions[pos]
    return (
      coords.x >= VIEWPORT_PADDING &&
      coords.x + tooltipRect.width <= viewport.width - VIEWPORT_PADDING &&
      coords.y >= VIEWPORT_PADDING &&
      coords.y + tooltipRect.height <= viewport.height - VIEWPORT_PADDING
    )
  }

  // Flip map for opposite positions
  const flipMap: Record<TooltipPosition, TooltipPosition> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  }

  // Determine final position with flip logic
  let finalPosition = preferredPosition
  if (!fitsInViewport(preferredPosition)) {
    const flipped = flipMap[preferredPosition]
    if (fitsInViewport(flipped)) {
      finalPosition = flipped
    }
  }

  // Get coords for final position
  let coords = positions[finalPosition]

  // Clamp to viewport bounds
  coords = {
    x: Math.max(
      VIEWPORT_PADDING,
      Math.min(coords.x, viewport.width - tooltipRect.width - VIEWPORT_PADDING)
    ),
    y: Math.max(
      VIEWPORT_PADDING,
      Math.min(coords.y, viewport.height - tooltipRect.height - VIEWPORT_PADDING)
    ),
  }

  // Calculate arrow offset to point at trigger center
  let arrowOffset = 0
  if (finalPosition === 'top' || finalPosition === 'bottom') {
    const triggerCenter = triggerRect.left + triggerRect.width / 2
    arrowOffset = triggerCenter - coords.x - ARROW_SIZE
    // Clamp arrow within tooltip bounds
    arrowOffset = Math.max(12, Math.min(arrowOffset, tooltipRect.width - 12 - ARROW_SIZE * 2))
  } else {
    const triggerCenter = triggerRect.top + triggerRect.height / 2
    arrowOffset = triggerCenter - coords.y - ARROW_SIZE
    arrowOffset = Math.max(12, Math.min(arrowOffset, tooltipRect.height - 12 - ARROW_SIZE * 2))
  }

  return { finalPosition, coords, arrowOffset }
}

// ============================================================================
// Arrow Component
// ============================================================================

interface ArrowProps {
  position: TooltipPosition
  offset: number
}

function Arrow({ position, offset }: ArrowProps) {
  const baseClasses = 'absolute w-0 h-0'

  const positionStyles: Record<TooltipPosition, React.CSSProperties> = {
    top: {
      bottom: -ARROW_SIZE,
      left: offset,
      borderLeft: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid transparent`,
      borderTop: `${ARROW_SIZE}px solid #0a0a0a`,
    },
    bottom: {
      top: -ARROW_SIZE,
      left: offset,
      borderLeft: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid #0a0a0a`,
    },
    left: {
      right: -ARROW_SIZE,
      top: offset,
      borderTop: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid transparent`,
      borderLeft: `${ARROW_SIZE}px solid #0a0a0a`,
    },
    right: {
      left: -ARROW_SIZE,
      top: offset,
      borderTop: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid #0a0a0a`,
    },
  }

  return <div className={baseClasses} style={positionStyles[position]} />
}

// ============================================================================
// Main Tooltip Component
// ============================================================================

export function Tooltip({
  content,
  children,
  position = 'top',
  align = 'center',
  delayShow = 400,
  delayHide = 0,
  maxWidth = 250,
  disabled = false,
  showArrow = false,
  offset = DEFAULT_OFFSET,
  className = '',
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords] = useState<Coords>({ x: 0, y: 0 })
  const [arrowOffset, setArrowOffset] = useState(0)
  const [actualPosition, setActualPosition] = useState(position)

  const triggerRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const tooltipId = useId()

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Position calculation
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = { width: window.innerWidth, height: window.innerHeight }

    const result = calculatePosition(
      triggerRect,
      tooltipRect,
      position,
      align,
      offset,
      viewport
    )

    setCoords(result.coords)
    setArrowOffset(result.arrowOffset)
    setActualPosition(result.finalPosition)
  }, [position, align, offset])

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      // Use RAF for initial calculation after render
      const raf = requestAnimationFrame(updatePosition)

      // Update on scroll/resize
      const handleUpdate = () => requestAnimationFrame(updatePosition)
      window.addEventListener('scroll', handleUpdate, true)
      window.addEventListener('resize', handleUpdate)

      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('scroll', handleUpdate, true)
        window.removeEventListener('resize', handleUpdate)
      }
    }
  }, [isOpen, updatePosition])

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (disabled) return
    clearTimeout(hideTimeoutRef.current)
    showTimeoutRef.current = setTimeout(() => setIsOpen(true), delayShow)
  }, [disabled, delayShow])

  const handleMouseLeave = useCallback(() => {
    clearTimeout(showTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => setIsOpen(false), delayHide)
  }, [delayHide])

  const handleFocus = useCallback(() => {
    if (disabled) return
    clearTimeout(hideTimeoutRef.current)
    setIsOpen(true)
  }, [disabled])

  const handleBlur = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current)
      clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  // Animation variants with directional awareness
  const getInitialAnimation = (pos: TooltipPosition) => ({
    opacity: 0,
    scale: 0.92,
    y: pos === 'top' ? 6 : pos === 'bottom' ? -6 : 0,
    x: pos === 'left' ? 6 : pos === 'right' ? -6 : 0,
  })

  // Clone child with ref and event handlers
  const trigger = cloneElement(children, {
    ref: triggerRef,
    'aria-describedby': isOpen ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter()
      children.props.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave()
      children.props.onMouseLeave?.(e)
    },
    onFocus: (e: React.FocusEvent) => {
      handleFocus()
      children.props.onFocus?.(e)
    },
    onBlur: (e: React.FocusEvent) => {
      handleBlur()
      children.props.onBlur?.(e)
    },
  })

  // Don't render portal on server or if disabled
  if (!mounted || disabled) {
    return trigger
  }

  const tooltipContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          initial={getInitialAnimation(actualPosition)}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.92,
            transition: { duration: 0.12, ease: CUSTOM_EASE },
          }}
          transition={{
            duration: 0.2,
            ease: CUSTOM_EASE,
          }}
          className={`
            fixed z-[9999] pointer-events-none
            px-3 py-2 rounded-lg
            font-body text-xs leading-normal
            text-white
            ${className}
          `}
          style={{
            left: coords.x,
            top: coords.y,
            maxWidth,
            background: '#0a0a0a',
            border: '1px solid #2a2a2a',
          }}
        >

          {content}

          {showArrow && <Arrow position={actualPosition} offset={arrowOffset} />}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {trigger}
      {createPortal(tooltipContent, document.body)}
    </>
  )
}

export default Tooltip
