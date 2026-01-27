import { useState } from 'react'
import { motion } from 'framer-motion'

export type ExpandableButtonVariant = 'default' | 'primary' | 'subtle'

export interface ExpandableButtonProps {
  /** Remixicon class name (e.g., "ri-add-line") */
  icon: string
  /** Label text to show when expanded */
  label: string
  /** Visual variant */
  variant?: ExpandableButtonVariant
  /** Click handler */
  onClick?: () => void
  /** Disable the button */
  disabled?: boolean
  /** Additional className */
  className?: string
}

const COLLAPSED_WIDTH = 28

// Calculate expanded width based on label length
const getExpandedWidth = (label: string) => {
  const baseWidth = 32 // padding + icon
  const charWidth = 6.5 // approximate width per character
  return Math.max(60, baseWidth + label.length * charWidth + 12)
}

const variantStyles: Record<
  ExpandableButtonVariant,
  { base: string; expanded: string; icon: string; iconExpanded: string; label: string }
> = {
  default: {
    base: 'bg-transparent',
    expanded: 'bg-white/5',
    icon: 'text-kol-text-muted',
    iconExpanded: 'text-white',
    label: 'text-white/90',
  },
  primary: {
    base: 'bg-kol-blue/10 border border-kol-blue/20',
    expanded: 'bg-kol-blue/20 border-kol-blue/40',
    icon: 'text-kol-blue',
    iconExpanded: 'text-kol-blue',
    label: 'text-kol-blue',
  },
  subtle: {
    base: 'bg-transparent',
    expanded: 'bg-white/5',
    icon: 'text-kol-text-muted',
    iconExpanded: 'text-white',
    label: 'text-white/80',
  },
}

export function ExpandableButton({
  icon,
  label,
  variant = 'default',
  onClick,
  disabled = false,
  className = '',
}: ExpandableButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const styles = variantStyles[variant]
  const expandedWidth = getExpandedWidth(label)

  return (
    <motion.button
      className={`
        group relative h-7 rounded-lg flex items-center justify-center overflow-hidden
        border border-transparent
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      initial={false}
      animate={{
        width: isExpanded ? expandedWidth : COLLAPSED_WIDTH,
        backgroundColor: isExpanded
          ? (variant === 'primary' ? 'rgba(0, 123, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)')
          : (variant === 'primary' ? 'rgba(0, 123, 255, 0.1)' : 'transparent'),
        borderColor: isExpanded
          ? (variant === 'primary' ? 'rgba(0, 123, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)')
          : (variant === 'primary' ? 'rgba(0, 123, 255, 0.2)' : 'transparent'),
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      onMouseEnter={() => !disabled && setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocus={() => !disabled && setIsExpanded(true)}
      onBlur={() => setIsExpanded(false)}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      <div className="flex items-center gap-1.5 px-2">
        {/* Icon */}
        <motion.i
          className={`${icon} text-sm flex-shrink-0`}
          animate={{
            color: isExpanded ? styles.iconExpanded : styles.icon,
          }}
          style={{
            color: isExpanded
              ? (variant === 'primary' ? '#007bff' : '#ffffff')
              : (variant === 'primary' ? '#007bff' : '#888888'),
          }}
        />

        {/* Label - fades in smoothly */}
        <motion.span
          className={`text-xs font-medium whitespace-nowrap ${styles.label}`}
          initial={false}
          animate={{
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? 'auto' : 0,
          }}
          transition={{
            opacity: { duration: 0.15, delay: isExpanded ? 0.03 : 0 },
            width: { type: 'spring', stiffness: 400, damping: 25 },
          }}
        >
          {label}
        </motion.span>
      </div>
    </motion.button>
  )
}

export default ExpandableButton
