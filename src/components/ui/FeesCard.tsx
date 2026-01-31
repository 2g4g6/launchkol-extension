import { useState } from 'react'

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
    <div className="group flex h-[52px] flex-1 cursor-text flex-col items-center justify-center rounded-lg border border-kol-border/50 bg-kol-surface/50 backdrop-blur-sm transition-all duration-200 focus-within:border-kol-blue/50 hover:border-kol-border-hover">
      <div className="relative flex h-[28px] w-full flex-row items-center justify-center border-b border-kol-border/30">
        <input
          placeholder={placeholder ?? '0.0'}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-[calc(100%-20px)] bg-transparent px-2 text-center align-middle text-[13px] font-mono tabular-nums leading-[28px] text-white outline-none placeholder:text-kol-text-muted/50"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-1 w-4 text-[12px] text-kol-text-muted">
            {suffix}
          </span>
        )}
      </div>
      <div className="flex h-[24px] w-full flex-row items-center justify-center gap-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider leading-4 text-kol-text-muted">{label}</span>
      </div>
    </div>
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
        <button
          onClick={() => setAutoFee(!autoFee)}
          className="flex items-center gap-2 flex-shrink-0 cursor-pointer group"
        >
          <div
            className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-200 ${
              autoFee
                ? 'border-kol-blue bg-kol-blue/20'
                : 'border-kol-border/70 hover:border-kol-border-hover'
            }`}
          >
            {autoFee && (
              <i className="ri-check-line text-[10px] text-kol-blue" />
            )}
          </div>
          <span className="text-[12px] font-medium text-kol-text-secondary whitespace-nowrap group-hover:text-white transition-colors">
            Auto Fee
          </span>
        </button>

        <div
          className={`flex h-8 w-full flex-row items-center gap-2 rounded-lg border border-kol-border/50 bg-kol-surface/50 backdrop-blur-sm pl-3 pr-1 transition-all duration-200 ${
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
            className="min-w-0 flex-1 text-[13px] font-mono tabular-nums text-white placeholder:text-kol-text-muted/50 bg-transparent outline-none text-right pr-1"
          />
        </div>
      </div>
    </div>
  )
}
