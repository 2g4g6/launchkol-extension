import { useState, useRef, useEffect, useCallback, ReactNode, ReactElement } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const CUSTOM_EASE = [0.16, 1, 0.3, 1] as const
const VIEWPORT_PADDING = 8

export interface QuickLinkPopoverProps {
  children: ReactElement
  content: ReactNode
  width?: number
  triggerMode?: 'hover' | 'click'
  showDelay?: number
  hideDelay?: number
  bare?: boolean
}

export function QuickLinkPopover({
  children,
  content,
  width = 320,
  triggerMode = 'hover',
  showDelay = 300,
  hideDelay = 200,
  bare = false,
}: QuickLinkPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number; below: boolean } | null>(null)

  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const x = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        rect.left + rect.width / 2 - width / 2,
        window.innerWidth - width - VIEWPORT_PADDING
      )
    )
    // Measure actual popover height if rendered, otherwise estimate
    const popoverHeight = popoverRef.current?.offsetHeight ?? 300
    const spaceAbove = rect.top - VIEWPORT_PADDING
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING
    // Prefer above, but flip below if not enough space above
    const below = spaceAbove < popoverHeight + 8 && spaceBelow > spaceAbove
    const y = below ? rect.bottom + 8 : rect.top - 8
    setPosition({ x, y, below })
  }, [width])

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(updatePosition)
      // Re-measure after popover renders to get actual height
      const raf2 = requestAnimationFrame(() => requestAnimationFrame(updatePosition))
      const handleUpdate = () => requestAnimationFrame(updatePosition)
      window.addEventListener('scroll', handleUpdate, true)
      window.addEventListener('resize', handleUpdate)
      return () => {
        cancelAnimationFrame(raf)
        cancelAnimationFrame(raf2)
        window.removeEventListener('scroll', handleUpdate, true)
        window.removeEventListener('resize', handleUpdate)
      }
    }
  }, [isOpen, updatePosition])

  // Close on click outside for click mode
  useEffect(() => {
    if (triggerMode !== 'click' || !isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node)
      ) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, triggerMode])

  const handleMouseEnter = useCallback(() => {
    if (triggerMode !== 'hover') return
    clearTimeout(hideTimeoutRef.current)
    showTimeoutRef.current = setTimeout(() => setIsOpen(true), showDelay)
  }, [triggerMode, showDelay])

  const handleMouseLeave = useCallback(() => {
    if (triggerMode !== 'hover') return
    clearTimeout(showTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => setIsOpen(false), hideDelay)
  }, [triggerMode, hideDelay])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (triggerMode !== 'click') return
    e.stopPropagation()
    e.preventDefault()
    setIsOpen(prev => !prev)
  }, [triggerMode])

  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current)
      clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  if (!mounted) {
    return <div ref={triggerRef}>{children}</div>
  }

  const popoverContent = (
    <AnimatePresence>
      {isOpen && position && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: position.below ? -6 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position.below ? -6 : 6, transition: { duration: 0.12, ease: CUSTOM_EASE } }}
          transition={{ duration: 0.18, ease: CUSTOM_EASE }}
          className="fixed z-[9999]"
          style={{
            left: position.x,
            ...(position.below
              ? { top: position.y }
              : { bottom: window.innerHeight - position.y }),
            width,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {bare ? content : (
            <div className="bg-kol-bg border border-kol-border rounded-xl shadow-[0_4px_4px_0_rgba(0,0,0,0.30),0_8px_8px_0_rgba(0,0,0,0.45)] overflow-hidden overflow-y-auto" style={{ maxHeight: `calc(100vh - ${VIEWPORT_PADDING * 2}px)` }}>
              {content}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </div>
      {createPortal(popoverContent, document.body)}
    </>
  )
}

export default QuickLinkPopover
