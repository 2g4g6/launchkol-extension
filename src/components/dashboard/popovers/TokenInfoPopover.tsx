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

function getPercentColor(value: number | undefined, inverted = false): string {
  if (value === undefined) return '#888888'
  const threshold = inverted ? value : 100 - value
  if (threshold >= 80) return 'text-kol-green'
  if (threshold >= 50) return 'text-yellow-500'
  return 'text-kol-red'
}

function StatCell({ icon, iconSize, value, label, colorClass }: {
  icon: string
  iconSize?: number
  value: string
  label: string
  colorClass: string
}) {
  return (
    <div className="flex h-[55px] w-full flex-col items-center justify-start gap-[8px] rounded-[4px] border border-kol-border/50 px-[8px] pb-[7px] pt-[6px]">
      <div className={`flex h-[18px] flex-1 flex-row items-center justify-start gap-[4px] ${colorClass}`}>
        <div className="flex h-[14px] max-h-[14px] min-h-[14px] w-[14px] min-w-[14px] max-w-[14px] items-center justify-center">
          <i className={`${icon} text-[14px]`} style={{ fontSize: iconSize ?? 14 }} />
        </div>
        <span className="text-[14px] font-normal leading-[16px]">{value}</span>
      </div>
      <div className="flex flex-1 flex-row items-center justify-start">
        <span className="text-[12px] font-normal leading-[16px] text-kol-text-muted">{label}</span>
      </div>
    </div>
  )
}

export function TokenInfoPopoverContent({ security, axiomUrl }: TokenInfoPopoverProps) {
  const fmt = (v: number | undefined, suffix = '%') => v !== undefined ? `${v}${suffix}` : '--'

  return (
    <div className="flex min-h-[0px] flex-1 flex-col gap-[16px] p-[16px] pt-[4px]">
      {/* Header */}
      <div className="flex items-center gap-2 pb-[4px]">
        <i className="ri-shield-check-line text-[14px] text-kol-text-muted" />
        <span className="text-[13px] font-semibold text-white">Token Info</span>
      </div>
      {/* Row 1: Top 10 H., Dev H., Snipers H. */}
      <div className="flex w-full flex-row gap-[16px]">
        <StatCell
          icon="ri-user-star-line"
          value={fmt(security.top10HoldersPercent)}
          label="Top 10 H."
          colorClass={getPercentColor(security.top10HoldersPercent)}
        />
        <StatCell
          icon="ri-user-settings-line"
          iconSize={12}
          value={fmt(security.devHoldersPercent)}
          label="Dev H."
          colorClass={getPercentColor(security.devHoldersPercent)}
        />
        <StatCell
          icon="ri-crosshair-2-line"
          value={fmt(security.snipersHoldersPercent)}
          label="Snipers H."
          colorClass={getPercentColor(security.snipersHoldersPercent)}
        />
      </div>

      {/* Row 2: Insiders, Bundlers, LP Burned */}
      <div className="flex w-full flex-row gap-[16px]">
        <StatCell
          icon="ri-ghost-line"
          value={fmt(security.insidersPercent)}
          label="Insiders"
          colorClass={getPercentColor(security.insidersPercent)}
        />
        <StatCell
          icon="ri-stack-line"
          iconSize={12}
          value={fmt(security.bundlersPercent)}
          label="Bundlers"
          colorClass={getPercentColor(security.bundlersPercent)}
        />
        <StatCell
          icon="ri-fire-line"
          value={fmt(security.lpBurnedPercent)}
          label="LP Burned"
          colorClass={getPercentColor(security.lpBurnedPercent, true)}
        />
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-kol-border/50" />

      {/* Row 3: Holders, Pro Traders, Dex Paid */}
      <div className="flex w-full flex-row gap-[16px]">
        <StatCell
          icon="ri-group-line"
          value={security.holdersCount !== undefined ? security.holdersCount.toLocaleString() : '--'}
          label="Holders"
          colorClass="text-kol-text-secondary"
        />
        <StatCell
          icon="ri-line-chart-line"
          iconSize={12}
          value={security.proTradersCount !== undefined ? String(security.proTradersCount) : '--'}
          label="Pro Traders"
          colorClass="text-kol-text-secondary"
        />
        <StatCell
          icon="ri-coins-line"
          iconSize={13}
          value={security.dexPaid === undefined ? '--' : security.dexPaid ? 'Paid' : 'Unpaid'}
          label="Dex Paid"
          colorClass={security.dexPaid === undefined ? 'text-kol-text-muted' : security.dexPaid ? 'text-kol-green' : 'text-kol-red'}
        />
      </div>

      {/* Footer link */}
      {axiomUrl && (
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
      )}
    </div>
  )
}
