export interface TokenSecurityInfo {
  top10HoldersPercent?: number
  devHoldersPercent?: number
  snipersHoldersPercent?: number
  insidersPercent?: number
  bundlersPercent?: number
  lpBurnedPercent?: number
  holdersCount?: number
  proTradersCount?: number
  dexPaid?: boolean
}

interface TokenInfoPopoverProps {
  security: TokenSecurityInfo
  axiomUrl?: string
}

function getColorForPercent(value: number, inverted = false): string {
  // For inverted metrics (like LP Burned), higher = safer
  const threshold = inverted ? value : 100 - value
  if (threshold >= 80) return '#00c46b' // green - safe
  if (threshold >= 50) return '#ff9500' // orange - caution
  return '#ff4d4f' // red - risky
}

function StatCell({ label, value, suffix = '%', inverted = false, isBoolean = false, boolValue }: {
  label: string
  value?: number
  suffix?: string
  inverted?: boolean
  isBoolean?: boolean
  boolValue?: boolean
}) {
  if (isBoolean) {
    return (
      <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-kol-surface border border-kol-border">
        <span className="text-[10px] text-kol-text-muted leading-none">{label}</span>
        <span
          className="text-[13px] font-semibold font-mono leading-none"
          style={{ color: boolValue ? '#00c46b' : '#ff4d4f' }}
        >
          {boolValue ? 'Yes' : 'No'}
        </span>
      </div>
    )
  }

  const displayValue = value !== undefined ? value : 0
  const color = value !== undefined ? getColorForPercent(displayValue, inverted) : '#888888'

  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-kol-surface border border-kol-border">
      <span className="text-[10px] text-kol-text-muted leading-none">{label}</span>
      <span
        className="text-[13px] font-semibold font-mono leading-none"
        style={{ color }}
      >
        {value !== undefined ? `${value}${suffix}` : '--'}
      </span>
    </div>
  )
}

export function TokenInfoPopoverContent({ security, axiomUrl }: TokenInfoPopoverProps) {
  return (
    <div style={{ width: 320 }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-kol-border">
        <i className="ri-shield-check-line text-sm text-kol-text-muted" />
        <span className="text-[13px] font-semibold text-white">Token Security</span>
      </div>

      {/* Stats grid */}
      <div className="p-3">
        <div className="grid grid-cols-3 gap-1.5">
          <StatCell label="Top 10 H." value={security.top10HoldersPercent} />
          <StatCell label="Dev H." value={security.devHoldersPercent} />
          <StatCell label="Snipers H." value={security.snipersHoldersPercent} />
          <StatCell label="Insiders" value={security.insidersPercent} />
          <StatCell label="Bundlers" value={security.bundlersPercent} />
          <StatCell label="LP Burned" value={security.lpBurnedPercent} inverted />
          <StatCell label="Holders" value={security.holdersCount} suffix="" />
          <StatCell label="Pro Traders" value={security.proTradersCount} suffix="" />
          <StatCell label="Dex Paid" isBoolean boolValue={security.dexPaid} />
        </div>
      </div>

      {/* Footer link */}
      {axiomUrl && (
        <div className="px-3 pb-3">
          <a
            href={axiomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full h-8 rounded-lg bg-white/5 border border-kol-border hover:bg-white/10 transition-colors text-[12px] font-medium text-white"
          >
            <svg width="12" height="12" viewBox="0 0 36 36" fill="currentColor">
              <path d="M24.1384 17.3876H11.8623L18.0001 7.00012L24.1384 17.3876Z" />
              <path d="M31 29.0003L5 29.0003L9.96764 20.5933L26.0324 20.5933L31 29.0003Z" />
            </svg>
            Trade on Axiom
            <i className="ri-external-link-line text-[11px]" />
          </a>
        </div>
      )}
    </div>
  )
}
