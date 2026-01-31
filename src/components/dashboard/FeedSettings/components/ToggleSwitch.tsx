import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export interface ToggleSwitchProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Desktop: off=3px, on=21px; Mobile: off=4px, on=26px
  const thumbLeft = isMobile
    ? (enabled ? 26 : 4)
    : (enabled ? 21 : 3)

  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative rounded-full transition-all duration-200
        w-10 h-[22px] max-sm:w-12 max-sm:h-7
        ${enabled
          ? 'bg-kol-blue shadow-[0_0_8px_rgba(0,123,255,0.4)]'
          : 'bg-kol-border'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <motion.div
        className="absolute w-4 h-4 max-sm:w-5 max-sm:h-5 rounded-full bg-white shadow-sm top-[3px] max-sm:top-1"
        animate={{ left: thumbLeft }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  )
}
