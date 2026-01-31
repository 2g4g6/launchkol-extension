import { useState } from 'react'
import { BaseModal } from './BaseModal'

interface FeesModalProps {
  isOpen: boolean
  onClose: () => void
}

const BRIBE_PRESETS = [0.001, 0.005, 0.01]
const SLIPPAGE_PRESETS = [0.5, 1, 3, 5]

interface PriorityTier {
  label: string
  value: number
}

const PRIORITY_TIERS: PriorityTier[] = [
  { label: 'Normal', value: 0.0001 },
  { label: 'Fast', value: 0.0005 },
  { label: 'Turbo', value: 0.001 },
]

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

export function FeesModal({ isOpen, onClose }: FeesModalProps) {
  const [autoFee, setAutoFee] = useState(false)
  const [bribeFee, setBribeFee] = useState('0.005')
  const [priorityTier, setPriorityTier] = useState(1)
  const [priorityFee, setPriorityFee] = useState('0.0005')
  const [slippagePreset, setSlippagePreset] = useState(2) // index into SLIPPAGE_PRESETS
  const [customSlippage, setCustomSlippage] = useState('')

  const disabled = autoFee

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Fee Settings" width="w-[360px]">
      <div className="space-y-4">
        {/* Auto Fee Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-white font-medium">Auto Fee</span>
            <p className="text-[11px] text-kol-text-muted mt-0.5">Use recommended values</p>
          </div>
          <Toggle checked={autoFee} onChange={setAutoFee} />
        </div>

        <div className="h-px bg-kol-border" />

        {/* Bribe Fee */}
        <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
          <label className="text-xs text-kol-text-muted font-medium uppercase tracking-wider">
            Bribe Fee
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={bribeFee}
                onChange={(e) => setBribeFee(e.target.value)}
                className="w-full bg-kol-surface border border-kol-border rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-kol-blue/60 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-kol-text-muted">
                SOL
              </span>
            </div>
          </div>
          <div className="flex gap-1.5 mt-2">
            {BRIBE_PRESETS.map((v) => (
              <button
                key={v}
                onClick={() => setBribeFee(String(v))}
                className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors ${
                  bribeFee === String(v)
                    ? 'bg-kol-blue/20 text-kol-blue border border-kol-blue/40'
                    : 'bg-kol-surface border border-kol-border text-kol-text-muted hover:border-kol-blue/30'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Fee */}
        <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
          <label className="text-xs text-kol-text-muted font-medium uppercase tracking-wider">
            Priority Fee
          </label>
          <div className="flex gap-1.5 mt-1.5">
            {PRIORITY_TIERS.map((tier, i) => (
              <button
                key={tier.label}
                onClick={() => {
                  setPriorityTier(i)
                  setPriorityFee(String(tier.value))
                }}
                className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-colors ${
                  priorityTier === i
                    ? 'bg-kol-blue/20 text-kol-blue border border-kol-blue/40'
                    : 'bg-kol-surface border border-kol-border text-kol-text-muted hover:border-kol-blue/30'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
          <div className="mt-2 relative">
            <input
              type="text"
              value={priorityFee}
              onChange={(e) => {
                setPriorityFee(e.target.value)
                setPriorityTier(-1)
              }}
              className="w-full bg-kol-surface border border-kol-border rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-kol-blue/60 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-kol-text-muted">
              SOL
            </span>
          </div>
        </div>

        {/* Slippage */}
        <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
          <label className="text-xs text-kol-text-muted font-medium uppercase tracking-wider">
            Slippage
          </label>
          <div className="flex gap-1.5 mt-1.5">
            {SLIPPAGE_PRESETS.map((v, i) => (
              <button
                key={v}
                onClick={() => {
                  setSlippagePreset(i)
                  setCustomSlippage('')
                }}
                className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-colors ${
                  slippagePreset === i && !customSlippage
                    ? 'bg-kol-blue/20 text-kol-blue border border-kol-blue/40'
                    : 'bg-kol-surface border border-kol-border text-kol-text-muted hover:border-kol-blue/30'
                }`}
              >
                {v}%
              </button>
            ))}
          </div>
          <div className="mt-2 relative">
            <input
              type="text"
              value={customSlippage}
              onChange={(e) => {
                setCustomSlippage(e.target.value)
                setSlippagePreset(-1)
              }}
              placeholder="Custom"
              className="w-full bg-kol-surface border border-kol-border rounded-md px-3 py-2 text-sm text-white font-mono placeholder:text-kol-text-muted/50 focus:outline-none focus:border-kol-blue/60 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-kol-text-muted">
              %
            </span>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
