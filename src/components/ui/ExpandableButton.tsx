import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tooltip } from './Tooltip'
import { useIsSmallScreen } from '../../shared/hooks/useMediaQuery'

export type ExpandableButtonVariant = 'default' | 'primary' | 'subtle'
export type ExpandableButtonSize = 'default' | 'large'

export interface ExpandableButtonProps {
  /** Remixicon class name (e.g., "ri-add-line") */
  icon: string
  /** Label text to show when expanded */
  label: string
  /** Visual variant */
  variant?: ExpandableButtonVariant
  /** Size variant */
  size?: ExpandableButtonSize
  /** Click handler */
  onClick?: () => void
  /** Disable the button */
  disabled?: boolean
  /** Additional className */
  className?: string
  /** When true, never expand — always show tooltip instead */
  tooltipOnly?: boolean
}

const sizeConfig = {
  default: {
    collapsedWidth: 28,
    height: 'h-7',
    iconSize: 'text-sm',
    labelSize: 'text-xs',
    baseWidth: 32,
    charWidth: 6.5,
  },
  large: {
    collapsedWidth: 36,
    height: 'h-9',
    iconSize: 'text-base',
    labelSize: 'text-sm',
    baseWidth: 40,
    charWidth: 7.5,
  },
}

// Calculate expanded width based on label length and size
const getExpandedWidth = (label: string, size: ExpandableButtonSize) => {
  const config = sizeConfig[size]
  return Math.max(size === 'large' ? 72 : 60, config.baseWidth + label.length * config.charWidth + 12)
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

const springTransition = { type: 'spring' as const, stiffness: 400, damping: 25 }
const instantTransition = { duration: 0 }

export function ExpandableButton({
  icon,
  label,
  variant = 'default',
  size = 'default',
  onClick,
  disabled = false,
  className = '',
  tooltipOnly = false,
}: ExpandableButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isSmall = useIsSmallScreen()

  // Track breakpoint changes to snap instantly instead of spring-animating
  const prevSmallRef = useRef(isSmall)
  const didBreakpointChange = prevSmallRef.current !== isSmall
  useEffect(() => { prevSmallRef.current = isSmall }, [isSmall])

  const styles = variantStyles[variant]
  const config = sizeConfig[size]
  const expandedWidth = getExpandedWidth(label, size)

  const collapsed = isSmall || tooltipOnly
  const isExpanded = !collapsed && isHovered
  const transition = didBreakpointChange ? instantTransition : springTransition

  return (
    <Tooltip content={label} position="top" delayShow={200} disabled={!collapsed}>
      <motion.button
        className={`
          group relative ${config.height} rounded-lg flex items-center justify-center overflow-hidden
          border border-transparent
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        initial={false}
        animate={{
          width: isExpanded ? expandedWidth : config.collapsedWidth,
          backgroundColor: isExpanded
            ? (variant === 'primary' ? 'rgba(0, 123, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)')
            : (variant === 'primary' ? 'rgba(0, 123, 255, 0.1)' : 'transparent'),
          borderColor: isExpanded
            ? (variant === 'primary' ? 'rgba(0, 123, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)')
            : (variant === 'primary' ? 'rgba(0, 123, 255, 0.2)' : 'transparent'),
        }}
        transition={transition}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => !disabled && setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        onClick={onClick}
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.97 }}
      >
        <div className={`flex items-center ${size === 'large' ? 'gap-2 px-2.5' : 'gap-1.5 px-2'}`}>
          {/* Icon */}
          <motion.i
            className={`${icon} ${config.iconSize} flex-shrink-0`}
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
            className={`${config.labelSize} font-medium whitespace-nowrap ${styles.label}`}
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? 'auto' : 0,
            }}
            transition={didBreakpointChange ? instantTransition : {
              opacity: { duration: 0.15, delay: isExpanded ? 0.03 : 0 },
              width: springTransition,
            }}
          >
            {label}
          </motion.span>
        </div>
      </motion.button>
    </Tooltip>
  )
}

export default ExpandableButton
