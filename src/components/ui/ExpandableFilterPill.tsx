import { useState } from 'react'
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

const COLLAPSED_WIDTH = 26
const BASE_WIDTH = 30
const CHAR_WIDTH = 6.2

const getExpandedWidth = (label: string, hasChildren: boolean) => {
  const extra = hasChildren ? 14 : 0
  return Math.max(48, BASE_WIDTH + label.length * CHAR_WIDTH + extra)
}

const spring = { type: 'spring' as const, stiffness: 400, damping: 25 }

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

  const expanded = isHovered || active
  const expandedWidth = getExpandedWidth(label, !!children)

  return (
    <motion.button
      ref={buttonRef}
      className={`relative flex items-center justify-center h-6 rounded text-xs font-medium border overflow-hidden whitespace-nowrap flex-shrink-0 ${
        active
          ? 'bg-kol-blue/15 text-kol-blue border-kol-blue/50'
          : 'bg-kol-surface/45 border-kol-border text-kol-text-muted hover:bg-kol-surface-elevated'
      }`}
      initial={false}
      animate={{
        width: expanded ? expandedWidth : COLLAPSED_WIDTH,
      }}
      transition={spring}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Icon - centered when collapsed, left-aligned when expanded */}
      <motion.div
        className="absolute flex items-center justify-center"
        initial={false}
        animate={{
          left: expanded ? 6 : '50%',
          x: expanded ? 0 : '-50%',
        }}
        transition={spring}
      >
        {iconSrc ? (
          <img src={iconSrc} alt="" className="w-4 h-4 rounded-sm flex-shrink-0" />
        ) : icon ? (
          <i className={`${icon} text-xs flex-shrink-0`} />
        ) : null}
      </motion.div>

      {/* Label - visible when expanded or active */}
      <motion.span
        className="absolute text-xs font-medium whitespace-nowrap overflow-hidden"
        style={{ left: iconSrc ? 24 : 20 }}
        initial={false}
        animate={{
          opacity: expanded ? 1 : 0,
        }}
        transition={{
          opacity: { duration: 0.15, delay: expanded ? 0.05 : 0 },
        }}
      >
        {label}
      </motion.span>

      {/* Optional children (e.g., chevron for dropdowns) */}
      {children && (
        <motion.span
          className="absolute flex items-center"
          style={{ right: 4 }}
          initial={false}
          animate={{
            opacity: expanded ? 1 : 0,
          }}
          transition={{
            opacity: { duration: 0.15, delay: expanded ? 0.05 : 0 },
          }}
        >
          {children}
        </motion.span>
      )}
    </motion.button>
  )
}
