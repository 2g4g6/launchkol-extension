import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export interface ExpandableFilterPillProps {
  /** Remixicon class name (e.g., "ri-list-check") */
  icon?: string
  /** Image source for icon (e.g., platform logos) */
  iconSrc?: string
  /** Label text to show when expanded */
  label: string
  /** Whether the pill is in active/selected state */
  active?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional children to render after the label (e.g., chevron) */
  children?: React.ReactNode
  /** Ref forwarding for the button */
  buttonRef?: React.Ref<HTMLButtonElement>
}

const COLLAPSED_SIZE = 28

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

export function ExpandableFilterPill({
  icon,
  iconSrc,
  label,
  active = false,
  onClick,
  children,
  buttonRef,
}: ExpandableFilterPillProps) {
  const [isHovered, setIsHovered] = useState(false)
  const measureRef = useRef<HTMLDivElement>(null)
  const [expandedWidth, setExpandedWidth] = useState(COLLAPSED_SIZE)

  const expanded = isHovered || active

  useEffect(() => {
    if (measureRef.current) {
      setExpandedWidth(measureRef.current.scrollWidth + 16)
    }
  }, [label, children])

  return (
    <motion.button
      ref={buttonRef}
      className={`h-7 rounded-md text-xs font-medium border overflow-hidden flex-shrink-0 ${
        active
          ? 'bg-kol-blue/15 text-kol-blue border-kol-blue/50'
          : 'bg-kol-surface/45 border-kol-border text-kol-text-muted hover:bg-kol-surface-elevated'
      }`}
      initial={false}
      animate={{ width: expanded ? expandedWidth : COLLAPSED_SIZE }}
      transition={spring}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Hidden measure element */}
      <div
        ref={measureRef}
        aria-hidden
        className="h-0 overflow-hidden flex items-center gap-1.5 whitespace-nowrap"
      >
        {iconSrc ? (
          <img src={iconSrc} alt="" className="w-[18px] h-[18px] rounded-sm" />
        ) : icon ? (
          <i className={`${icon} text-sm`} />
        ) : null}
        <span className="text-xs font-medium">{label}</span>
        {children}
      </div>

      {/* Visible content — no gap, label uses ml when visible */}
      <div className="flex items-center justify-center h-full px-[5px] whitespace-nowrap">
        <div className="flex-shrink-0 flex items-center justify-center w-[18px] h-[18px]">
          {iconSrc ? (
            <img src={iconSrc} alt="" className="w-[18px] h-[18px] rounded-sm" />
          ) : icon ? (
            <i className={`${icon} text-sm`} />
          ) : null}
        </div>

        <motion.span
          className="text-xs font-medium whitespace-nowrap overflow-hidden"
          initial={false}
          animate={{
            width: expanded ? 'auto' : 0,
            marginLeft: expanded ? 6 : 0,
            opacity: expanded ? 1 : 0,
          }}
          transition={{
            width: spring,
            marginLeft: spring,
            opacity: { duration: 0.12, delay: expanded ? 0.06 : 0 },
          }}
        >
          {label}
        </motion.span>

        {children && (
          <motion.span
            className="flex items-center flex-shrink-0 overflow-hidden"
            initial={false}
            animate={{
              width: expanded ? 'auto' : 0,
              marginLeft: expanded ? 4 : 0,
              opacity: expanded ? 1 : 0,
            }}
            transition={{
              width: spring,
              marginLeft: spring,
              opacity: { duration: 0.12, delay: expanded ? 0.06 : 0 },
            }}
          >
            {children}
          </motion.span>
        )}
      </div>
    </motion.button>
  )
}
