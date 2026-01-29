import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tooltip } from './Tooltip'
import { useIsSmallScreen } from '../../shared/hooks/useMediaQuery'

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

const spring = { type: 'spring' as const, stiffness: 380, damping: 26 }

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
  const isSmall = useIsSmallScreen()

  const expanded = !isSmall && (isHovered || active)

  useEffect(() => {
    if (measureRef.current) {
      setExpandedWidth(measureRef.current.scrollWidth + 2)
    }
  }, [label, children])

  const iconContent = iconSrc ? (
    <img src={iconSrc} alt="" className="w-[18px] h-[18px] rounded-sm" />
  ) : icon ? (
    <i className={`${icon} text-sm`} />
  ) : null

  const pill = (
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
      {/* Hidden measure element — matches visible layout exactly */}
      <div
        ref={measureRef}
        aria-hidden
        className="h-0 overflow-hidden flex items-center whitespace-nowrap w-max"
        style={{ paddingLeft: 5, paddingRight: 8, gap: 6 }}
      >
        <div className="flex-shrink-0 flex items-center justify-center w-[18px] h-[18px]">
          {iconContent}
        </div>
        <span className="text-xs font-medium">{label}</span>
        {children}
      </div>

      {/* Visible content — always fully laid out, revealed by button overflow:hidden */}
      <div
        className="flex items-center h-full whitespace-nowrap"
        style={{ paddingLeft: 5, paddingRight: 8, gap: 6 }}
      >
        <div className="flex-shrink-0 flex items-center justify-center w-[18px] h-[18px]">
          {iconContent}
        </div>

        <motion.span
          className="text-xs font-medium whitespace-nowrap"
          initial={false}
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.1, delay: expanded ? 0.02 : 0 }}
        >
          {label}
        </motion.span>

        {children && (
          <motion.span
            className="flex items-center flex-shrink-0"
            initial={false}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.1, delay: expanded ? 0.02 : 0 }}
          >
            {children}
          </motion.span>
        )}
      </div>
    </motion.button>
  )

  if (isSmall) {
    return (
      <Tooltip content={label} position="top" delayShow={200}>
        {pill}
      </Tooltip>
    )
  }

  return pill
}
