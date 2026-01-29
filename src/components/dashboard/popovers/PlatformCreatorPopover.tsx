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
}

export function PlatformCreatorPopoverContent({
  platformName,
  platformLogo,
  platformColor,
  platformFee,
  creator,
}: PlatformCreatorPopoverProps) {
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

      {/* Creator info */}
      {creator && (
        <div className="border-t border-kol-border pt-3">
          <div className="flex items-center gap-2.5">
            {creator.avatar ? (
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-kol-border/50"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-kol-surface-elevated flex items-center justify-center ring-1 ring-kol-border/50">
                <span className="text-xs font-bold text-kol-text-muted">
                  {creator.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-white truncate">{creator.name}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-kol-blue/15 text-kol-blue border border-kol-blue/30">
                  Creator
                </span>
              </div>
            </div>
          </div>

          {creator.rewardsPercent !== undefined && (
            <div className="flex items-center justify-between mt-2.5 px-1">
              <span className="text-[11px] text-kol-text-muted">Creator rewards</span>
              <span className="text-[12px] font-medium text-kol-green">
                {creator.rewardsPercent}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
