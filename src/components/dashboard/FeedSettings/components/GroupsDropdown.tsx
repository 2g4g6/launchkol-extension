import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FeedGroup } from '../types'

export interface GroupsDropdownProps {
  isOpen: boolean
  onClose: () => void
  groups: FeedGroup[]
  selectedGroupId: string | null
  onSelectGroup: (groupId: string | null) => void
  onCreateGroup: () => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

export function GroupsDropdown({
  isOpen,
  onClose,
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  triggerRef,
}: GroupsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, triggerRef])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleSelectGroup = (groupId: string | null) => {
    onSelectGroup(groupId)
    onClose()
  }

  const handleCreateGroup = () => {
    onCreateGroup()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-kol-bg border border-kol-border rounded-lg shadow-xl overflow-hidden"
        >
          {/* Groups List */}
          <div className="max-h-[280px] overflow-y-auto scrollbar-styled">
            {/* All Feeds Option */}
            <button
              onClick={() => handleSelectGroup(null)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 transition-colors
                ${selectedGroupId === null
                  ? 'bg-kol-blue/10'
                  : 'hover:bg-kol-surface-elevated/50'
                }
              `}
            >
              <div className="w-8 h-8 rounded-lg bg-kol-surface-elevated flex items-center justify-center flex-shrink-0">
                <i className="ri-global-line text-sm text-kol-text-muted" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-white">All Feeds</p>
                <p className="text-[10px] text-kol-text-muted">Global settings</p>
              </div>
              {selectedGroupId === null && (
                <i className="ri-check-line text-kol-blue flex-shrink-0" />
              )}
            </button>

            {/* Divider */}
            {groups.length > 0 && (
              <div className="h-px bg-kol-border/30 mx-3" />
            )}

            {/* Group Items */}
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleSelectGroup(group.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 transition-colors
                  ${selectedGroupId === group.id
                    ? 'bg-kol-blue/10'
                    : 'hover:bg-kol-surface-elevated/50'
                  }
                `}
              >
                <div className="w-8 h-8 rounded-lg bg-kol-surface-elevated flex items-center justify-center flex-shrink-0">
                  <i className={`${group.icon} text-sm text-kol-text-muted`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">{group.name}</p>
                </div>
                <span className="text-[10px] text-kol-text-muted flex-shrink-0">
                  {group.accounts.length}
                </span>
                {selectedGroupId === group.id && (
                  <i className="ri-check-line text-kol-blue flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* New Group Button */}
          <div className="border-t border-kol-border/30 p-2">
            <button
              onClick={handleCreateGroup}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated/50 transition-colors"
            >
              <i className="ri-add-line text-sm" />
              <span className="text-xs font-medium">New Group</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GroupsDropdown
