import { useState } from 'react'
import { motion } from 'framer-motion'

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative rounded-full transition-all duration-200 w-10 h-[22px] flex-shrink-0 cursor-pointer ${
        enabled
          ? 'bg-kol-blue shadow-[0_0_8px_rgba(0,123,255,0.4)]'
          : 'bg-kol-border'
      }`}
    >
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-white shadow-sm top-[3px]"
        animate={{ left: enabled ? 21 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

const SOUND_OPTIONS = [
  { key: 'tradeAlerts', label: 'Trade Alerts', icon: 'ri-exchange-line' },
  { key: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
  { key: 'uiSounds', label: 'UI Sounds', icon: 'ri-mouse-line' },
] as const

type SoundKey = typeof SOUND_OPTIONS[number]['key']

export function SoundCardContent() {
  const [masterSound, setMasterSound] = useState(true)
  const [sounds, setSounds] = useState<Record<SoundKey, boolean>>({
    tradeAlerts: true,
    notifications: true,
    uiSounds: false,
  })

  const toggleSound = (key: SoundKey) => {
    setSounds((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="p-3 space-y-3">
      {/* Master toggle */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2.5">
          <i className={`ri-volume-up-line text-base ${masterSound ? 'text-kol-blue' : 'text-kol-text-muted'}`} />
          <span className="text-sm text-white font-medium">Master Sound</span>
        </div>
        <ToggleSwitch enabled={masterSound} onChange={setMasterSound} />
      </div>

      <div className="h-px bg-kol-border" />

      {/* Individual toggles */}
      <div className={`space-y-1 ${!masterSound ? 'opacity-40 pointer-events-none' : ''}`}>
        {SOUND_OPTIONS.map((opt) => (
          <div key={opt.key} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2.5">
              <i className={`${opt.icon} text-sm text-kol-text-muted`} />
              <span className="text-[13px] text-kol-text-muted">{opt.label}</span>
            </div>
            <ToggleSwitch enabled={sounds[opt.key]} onChange={() => toggleSound(opt.key)} />
          </div>
        ))}
      </div>
    </div>
  )
}
