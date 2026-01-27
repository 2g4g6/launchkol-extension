import { motion } from 'framer-motion'

export interface ToggleSwitchProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative w-10 h-[22px] rounded-full transition-all duration-200
        ${enabled
          ? 'bg-kol-blue shadow-[0_0_8px_rgba(0,123,255,0.4)]'
          : 'bg-kol-border'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <motion.div
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? 21 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  )
}
