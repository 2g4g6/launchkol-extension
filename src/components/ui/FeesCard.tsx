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
    <div className="group flex h-[52px] flex-1 cursor-text flex-col items-center justify-center rounded-lg border border-kol-border transition-colors duration-150 focus-within:border-white/10 hover:border-white/10">
      <div className="relative flex h-[28px] w-full flex-row items-center justify-center border-b border-kol-border bg-kol-border/50">
        <input
          placeholder={placeholder ?? '0.0'}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-[calc(100%-20px)] bg-transparent px-3 text-center align-middle text-[14px] font-mono tabular-nums leading-[28px] text-white outline-none placeholder:text-kol-text-muted"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-0 w-5 text-[14px] text-kol-text-muted">
            {suffix}
          </span>
        )}
      </div>
      <div className="flex h-[24px] w-full flex-row items-center justify-center">
        {icon}
        <span className="text-[12px] font-normal leading-4 text-kol-text-muted">{label}</span>
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
    <div className="flex flex-1 flex-col justify-start gap-4 p-4">
      {/* Three fee inputs in a row */}
      <div className="flex w-full flex-row items-center justify-start gap-4">
        <FeeInput
          value={slippage}
          onChange={setSlippage}
          suffix="%"
          label="SLIPPAGE"
          icon={
            <img src="/images/slippage.svg" alt="Slippage" width={12} height={12} className="mr-1 opacity-60" />
          }
        />
        <FeeInput
          value={priority}
          onChange={setPriority}
          label="PRIORITY"
          icon={
            <i className="ri-gas-station-line mr-1 text-[12px] text-kol-text-muted" />
          }
        />
        <FeeInput
          value={bribe}
          onChange={setBribe}
          label="BRIBE"
          icon={
            <i className="ri-coin-line mr-1 text-[12px] text-kol-text-muted" />
          }
        />
      </div>

      {/* Auto Fee + Max Fee row */}
      <div className="flex h-8 w-full flex-row items-center justify-start gap-4">
        <div className="flex h-8 w-full min-w-[100px] max-w-[100px] flex-row items-center justify-start">
          <button
            onClick={() => setAutoFee(!autoFee)}
            className="inline-flex h-4 flex-row gap-2 items-center justify-start cursor-pointer"
          >
            <div className="border border-kol-border flex h-4 w-4 flex-row items-center justify-center p-0.5 rounded cursor-pointer">
              <div
                className={`h-2.5 w-2.5 rounded-sm transition-colors duration-150 ${
                  autoFee ? 'bg-kol-blue' : 'bg-transparent'
                }`}
              />
            </div>
            <span className="text-white text-[12px] text-nowrap font-medium">Auto Fee</span>
          </button>
        </div>

        <div
          className={`relative overflow-hidden border-kol-border flex h-8 w-full flex-row items-center justify-start gap-2 border pl-3 font-normal rounded-full transition-colors duration-150 ${
            autoFee
              ? 'focus-within:border-white/10 focus-within:bg-kol-border/10 hover:border-white/10 hover:bg-kol-border/10'
              : 'pointer-events-none cursor-not-allowed opacity-50'
          }`}
        >
          <span className="flex-shrink-0 text-[14px] text-kol-text-muted font-medium">MAX FEE</span>
          <input
            placeholder="0.0"
            type="text"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            className="min-w-0 flex-1 text-[14px] font-mono tabular-nums text-white placeholder:text-kol-text-muted bg-transparent font-normal outline-none"
          />
        </div>
      </div>
    </div>
  )
}
