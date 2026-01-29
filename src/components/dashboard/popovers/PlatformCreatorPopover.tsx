export interface CreatorInfo {
  name: string
  avatar?: string
  rewardsPercent?: number
}

interface PlatformCreatorPopoverProps {
  platformName: string
  platformLogo: string
  platformColor: string
  platformFee?: string
  creator?: CreatorInfo
  progressPercent?: number
  totalVolumeUsd?: number
  solPrice?: number
}

export function PlatformCreatorPopoverContent({
  platformName,
  platformLogo,
  platformColor,
  platformFee,
  creator,
  progressPercent,
  totalVolumeUsd,
  solPrice,
}: PlatformCreatorPopoverProps) {
  const isMigrated = progressPercent !== undefined && progressPercent >= 100
  const creatorFeesEarnedSol =
    creator?.rewardsPercent !== undefined && totalVolumeUsd !== undefined && solPrice
      ? (totalVolumeUsd * creator.rewardsPercent) / 100 / solPrice
      : undefined

  return (
    <div className="p-3 space-y-3" style={{ width: 280 }}>
      {/* Platform header */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${platformColor}25`, border: `1px solid ${platformColor}40` }}
        >
          <img src={platformLogo} alt={platformName} className="w-5 h-5 object-contain" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{platformName}</div>
          {platformFee && (
            <div className="text-[11px] text-kol-text-muted">
              Platform fee: <span className="text-kol-text-secondary">{platformFee}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bonding curve progress */}
      {progressPercent !== undefined && (
        <div className="border-t border-kol-border pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-kol-text-muted">Bonding curve</span>
            <span className={`text-[12px] font-medium ${isMigrated ? 'text-kol-green' : 'text-kol-blue'}`}>
              {isMigrated ? 'Migrated' : `${progressPercent}%`}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-kol-surface-elevated overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isMigrated ? 'bg-kol-green' : 'bg-kol-blue'}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          {!isMigrated && (
            <div className="text-[10px] text-kol-text-muted">
              {100 - progressPercent}% remaining to migration
            </div>
          )}
        </div>
      )}

      {/* Launched by + Creator rewards */}
      {creator && (
        <div className="border-t border-kol-border pt-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-kol-text-muted">Launched by</span>
            <div className="flex items-center gap-1.5">
              {creator.avatar ? (
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-kol-border/50"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-kol-surface-elevated flex items-center justify-center ring-1 ring-kol-border/50">
                  <span className="text-[8px] font-bold text-kol-text-muted">
                    {creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-[12px] font-medium text-white">{creator.name}</span>
            </div>
          </div>
          {creator.rewardsPercent !== undefined && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-kol-text-muted">Creator rewards</span>
              <span className="text-[12px] font-medium text-kol-green">
                {creator.rewardsPercent}%
              </span>
            </div>
          )}
          {creatorFeesEarnedSol !== undefined && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-kol-text-muted">Fees earned</span>
              <div className="flex items-center gap-1">
                <img alt="SOL" width="12" height="12" src="/images/solanaLogoMark.svg" />
                <span className="text-[12px] font-medium text-kol-text-secondary">
                  {creatorFeesEarnedSol < 0.01 ? '<0.01' : creatorFeesEarnedSol < 100 ? creatorFeesEarnedSol.toFixed(2) : creatorFeesEarnedSol < 10000 ? creatorFeesEarnedSol.toFixed(1) : Math.round(creatorFeesEarnedSol).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
