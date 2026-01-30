import { useRef, useEffect } from 'react'
import type { PlatformType, Recipient } from '../CoinCard'

export interface CreatorInfo {
  name: string
  avatar?: string
  rewardsPercent?: number
  walletAddress?: string
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
  platformUrl?: string
  platformType?: PlatformType
  recipients?: Recipient[]
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
  platformUrl,
  platformType,
  recipients,
}: PlatformCreatorPopoverProps) {
  const creatorRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const walletRef = useRef<HTMLSpanElement>(null)
  const walletIconRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = creatorRef.current
    const nameEl = nameRef.current
    const walletEl = walletRef.current
    const walletIconEl = walletIconRef.current
    if (!el || !nameEl || !walletEl) return

    const onEnter = () => {
      nameEl.style.display = 'none'
      walletEl.style.display = 'inline'
      if (walletIconEl) walletIconEl.style.display = 'inline'
    }
    const onLeave = () => {
      nameEl.style.display = 'inline'
      walletEl.style.display = 'none'
      if (walletIconEl) walletIconEl.style.display = 'none'
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [creator?.walletAddress])

  const isMigrated = progressPercent !== undefined && progressPercent >= 100
  const creatorFeesEarnedSol =
    creator?.rewardsPercent !== undefined && totalVolumeUsd !== undefined && solPrice
      ? (totalVolumeUsd * creator.rewardsPercent) / 100 / solPrice
      : undefined

  // Platform-specific visibility flags
  const showCreatorRewards = platformType !== 'pump' && platformType !== 'bonk' && platformType !== 'mayhem' && platformType !== 'fourmeme' && platformType !== 'bags'
  const showFeesEarned = platformType !== 'fourmeme' && platformType !== 'bags'
  const isBags = platformType === 'bags'
  const isBonk = platformType === 'bonk'

  // Bags: calculate total royalties from volume
  const bagsRoyaltiesSol =
    isBags && creator?.rewardsPercent !== undefined && totalVolumeUsd !== undefined && solPrice
      ? (totalVolumeUsd * creator.rewardsPercent) / 100 / solPrice
      : undefined

  return (
    <div className="p-3 space-y-3" style={{ width: 280 }}>
      {/* Platform header + Open button */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${platformColor}25`, border: `1px solid ${platformColor}40` }}
        >
          <img src={platformLogo} alt={platformName} className="w-5 h-5 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">{platformName}</div>
          {platformFee && (
            <div className="text-[11px] text-kol-text-muted">
              Platform fee: <span className="text-kol-text-secondary">{platformFee}</span>
            </div>
          )}
        </div>
        {platformUrl && (
          <a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/open flex items-center gap-1 h-6 px-1.5 rounded-md bg-kol-surface-elevated hover:bg-kol-border transition-all ml-auto"
          >
            <i className="ri-external-link-line text-[13px] text-kol-text-muted group-hover/open:text-white transition-colors" />
            <span className="text-[11px] font-medium text-kol-text-muted group-hover/open:text-white max-w-0 overflow-hidden group-hover/open:max-w-[40px] transition-all duration-200">
              Open
            </span>
          </a>
        )}
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
            <div ref={creatorRef} className="flex items-center gap-1.5 cursor-pointer">
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
              <span ref={nameRef} className="text-[12px] font-medium text-white">{creator.name}</span>
              {creator.walletAddress && (
                <>
                  <i ref={walletIconRef} style={{ display: 'none' }} className="ri-wallet-3-line text-[12px] text-white" />
                  <span ref={walletRef} style={{ display: 'none' }} className="text-[11px] font-mono text-white">
                    {creator.walletAddress.slice(0, 6)}...{creator.walletAddress.slice(-4)}
                  </span>
                </>
              )}
            </div>
          </div>
          {showCreatorRewards && creator.rewardsPercent !== undefined && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-kol-text-muted">Creator rewards</span>
              <span className="text-[12px] font-medium text-kol-green">
                {creator.rewardsPercent}%
              </span>
            </div>
          )}
          {showFeesEarned && creatorFeesEarnedSol !== undefined && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-kol-text-muted">Fees earned</span>
              <div className="flex items-center gap-1">
                <img alt="SOL" width="12" height="12" src="/images/solanaLogoMark.svg" />
                <span className="text-[12px] font-bold text-kol-text-secondary">
                  {creatorFeesEarnedSol < 0.01 ? '<0.01' : creatorFeesEarnedSol < 100 ? creatorFeesEarnedSol.toFixed(2) : creatorFeesEarnedSol < 10000 ? creatorFeesEarnedSol.toFixed(1) : Math.round(creatorFeesEarnedSol).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bags: Royalties + Recipients */}
      {isBags && (
        <div className="space-y-2">
          {bagsRoyaltiesSol !== undefined && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-kol-text-muted">Total Royalties</span>
              <div className="flex items-center gap-1">
                <img alt="SOL" width="12" height="12" src="/images/solanaLogoMark.svg" />
                <span className="text-[12px] font-bold text-kol-text-secondary">
                  {bagsRoyaltiesSol < 0.01 ? '<0.01' : bagsRoyaltiesSol < 100 ? bagsRoyaltiesSol.toFixed(2) : bagsRoyaltiesSol < 10000 ? bagsRoyaltiesSol.toFixed(1) : Math.round(bagsRoyaltiesSol).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          {recipients && recipients.length > 0 && (
            <>
              <div className="text-[11px] text-kol-text-muted px-1 pt-1">Recipients</div>
              {recipients.map((recipient, i) => (
                <RecipientRow key={i} recipient={recipient} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Quote currency */}
      <div className="border-t border-kol-border pt-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-kol-text-muted">Quote</span>
          {isBonk ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-usd1/[0.075]">
              <img src="/images/usd1.svg" alt="USD1" className="w-[14px] h-[14px]" />
              <span className="text-[12px] font-medium text-usd1">USD1</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <img alt="SOL" width="14" height="14" src="/images/solanaLogoMark.svg" />
              <span className="text-[12px] font-medium text-white">SOL</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RecipientRow({ recipient }: { recipient: Recipient }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(recipient.walletAddress)
  }

  return (
    <div className="px-1 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {recipient.avatar ? (
            <img
              src={recipient.avatar}
              alt={recipient.name}
              className="w-4 h-4 rounded-full object-cover ring-1 ring-kol-border/50"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-kol-surface-elevated flex items-center justify-center ring-1 ring-kol-border/50">
              <span className="text-[8px] font-bold text-kol-text-muted">
                {recipient.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-[12px] font-medium text-white">{recipient.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <i className="ri-refresh-line text-[11px] text-kol-text-muted" />
          <span className="text-[12px] font-medium text-kol-text-secondary">{recipient.percent}%</span>
        </div>
      </div>
      <div className="flex items-center justify-between pl-[22px]">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] font-mono text-kol-text-muted hover:text-white transition-colors"
        >
          <i className="ri-file-copy-line text-[10px]" />
          <span>{recipient.walletAddress.slice(0, 4)}...{recipient.walletAddress.slice(-4)}</span>
        </button>
        <div className="flex items-center gap-1">
          <img alt="SOL" width="11" height="11" src="/images/solanaLogoMark.svg" />
          <span className="text-[11px] font-bold text-kol-text-secondary">
            {recipient.earnedSol < 0.01 && recipient.earnedSol > 0 ? '<0.01' : recipient.earnedSol.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
