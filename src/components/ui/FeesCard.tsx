import { useState } from 'react'
import { motion } from 'framer-motion'

function FeeInput({
  value,
  onChange,
  placeholder,
  suffix,
  label,
  icon,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  suffix?: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="group flex h-[52px] flex-1 min-w-0 cursor-text flex-col items-center justify-center rounded-lg border border-kol-border/50 overflow-hidden transition-all duration-200 focus-within:border-kol-blue/50 hover:border-kol-border-hover">
      {/* Input area — lighter */}
      <div className="relative flex h-[28px] w-full flex-row items-center justify-center bg-kol-surface-elevated/80 border-b border-kol-border/30">
        <input
          placeholder={placeholder ?? '0.0'}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-2 text-center align-middle text-[13px] tabular-nums leading-[28px] text-white outline-none placeholder:text-kol-text-muted/50"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-1.5 text-[12px] text-kol-text-muted">
            {suffix}
          </span>
        )}
      </div>
      {/* Label area — darker */}
      <div className="flex h-[24px] w-full flex-row items-center justify-center gap-1 bg-kol-surface/60">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider leading-4 text-kol-text-muted">{label}</span>
      </div>
    </div>
  )
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative rounded-full transition-all duration-200 w-10 h-[22px] flex-shrink-0 cursor-pointer ${
        enabled
          ? 'bg-kol-blue toggle-glow'
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

export function FeesCardContent() {
  const [autoFee, setAutoFee] = useState(false)
  const [slippage, setSlippage] = useState('20')
  const [priority, setPriority] = useState('0.001')
  const [bribe, setBribe] = useState('0.01')
  const [maxFee, setMaxFee] = useState('0.1')

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Three fee inputs in a row */}
      <div className="flex w-full flex-row items-center gap-2">
        <FeeInput
          value={slippage}
          onChange={setSlippage}
          suffix="%"
          label="Slippage"
          icon={
            <img src="/images/slippage.svg" alt="" width={11} height={11} className="opacity-50" />
          }
        />
        <FeeInput
          value={priority}
          onChange={setPriority}
          label="Priority"
          icon={
            <i className="ri-gas-station-line text-[11px] text-kol-text-muted" />
          }
        />
        <FeeInput
          value={bribe}
          onChange={setBribe}
          label="Bribe"
          icon={
            <i className="ri-coin-line text-[11px] text-kol-text-muted" />
          }
        />
      </div>

      {/* Auto Fee + Max Fee row */}
      <div className="flex h-8 w-full flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <ToggleSwitch enabled={autoFee} onChange={setAutoFee} />
          <span className="text-[12px] font-medium text-kol-text-secondary whitespace-nowrap">
            Auto Fee
          </span>
        </div>

        <div
          className={`flex h-8 min-w-0 flex-1 flex-row items-center gap-2 rounded-lg border border-kol-border/50 bg-kol-surface/50 pl-3 pr-2 transition-all duration-200 ${
            autoFee
              ? 'focus-within:border-kol-blue/50 hover:border-kol-border-hover'
              : 'pointer-events-none opacity-40'
          }`}
        >
          <span className="flex-shrink-0 text-[11px] text-kol-text-muted font-medium uppercase tracking-wider">Max Fee</span>
          <input
            placeholder="0.0"
            type="text"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            className="min-w-0 flex-1 text-[13px] tabular-nums text-white placeholder:text-kol-text-muted/50 bg-transparent outline-none text-right"
          />
        </div>
      </div>
    </div>
  )
}
