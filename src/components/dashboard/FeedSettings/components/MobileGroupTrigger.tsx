import { forwardRef } from 'react'
import type { FeedGroup } from '../types'

export interface MobileGroupTriggerProps {
  selectedGroup: FeedGroup | null
  isOpen: boolean
  onClick: () => void
}

export const MobileGroupTrigger = forwardRef<HTMLButtonElement, MobileGroupTriggerProps>(
  function MobileGroupTrigger({ selectedGroup, isOpen, onClick }, ref) {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-kol-surface/50 border rounded-lg transition-colors hover:bg-kol-surface-elevated/50 ${
          isOpen ? 'border-kol-blue/50' : 'border-kol-border/50'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <i className={`${selectedGroup?.icon || 'ri-global-line'} text-sm text-kol-text-muted`} />
          <span className="text-sm font-medium text-white truncate">
            {selectedGroup?.name || 'All Feeds'}
          </span>
          {selectedGroup && (
            <span className="text-[10px] text-kol-text-muted">
              ({selectedGroup.accounts.length})
            </span>
          )}
        </div>
        <i className={`ri-arrow-down-s-line text-kol-text-muted flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    )
  }
)

export default MobileGroupTrigger
