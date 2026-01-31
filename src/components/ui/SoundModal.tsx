import { useState } from 'react'
import { BaseModal } from './BaseModal'

interface SoundModalProps {
  isOpen: boolean
  onClose: () => void
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
        checked ? 'bg-kol-blue' : 'bg-kol-border'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
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

export function SoundModal({ isOpen, onClose }: SoundModalProps) {
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
    <BaseModal isOpen={isOpen} onClose={onClose} title="Sound" width="w-[320px]">
      <div className="space-y-3">
        {/* Master toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <i className={`ri-volume-up-line text-base ${masterSound ? 'text-kol-blue' : 'text-kol-text-muted'}`} />
            <span className="text-sm text-white font-medium">Master Sound</span>
          </div>
          <Toggle checked={masterSound} onChange={setMasterSound} />
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
              <Toggle checked={sounds[opt.key]} onChange={() => toggleSound(opt.key)} />
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  )
}
