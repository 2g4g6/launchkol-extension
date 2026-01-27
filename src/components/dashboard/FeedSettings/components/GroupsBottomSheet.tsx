import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { createPortal } from 'react-dom'
import type { FeedGroup } from '../types'

export interface GroupsBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  groups: FeedGroup[]
  selectedGroupId: string | null
  onSelectGroup: (groupId: string | null) => void
  onCreateGroup: () => void
}

export function GroupsBottomSheet({
  isOpen,
  onClose,
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
}: GroupsBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

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

  // Handle swipe down to dismiss
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 300 || info.offset.y > 100) {
      onClose()
    }
  }

  const handleSelectGroup = (groupId: string | null) => {
    onSelectGroup(groupId)
    onClose()
  }

  const handleCreateGroup = () => {
    onCreateGroup()
    onClose()
  }

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70"
          onClick={onClose}
        >
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 400,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-kol-bg rounded-t-2xl border-t border-x border-kol-border overflow-hidden pb-safe"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-kol-border rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 border-b border-kol-border/50">
              <h3 className="text-sm font-medium text-white">Select Group</h3>
            </div>

            {/* Groups List */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-styled">
              {/* All Feeds Option */}
              <button
                onClick={() => handleSelectGroup(null)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 transition-colors
                  ${selectedGroupId === null
                    ? 'bg-kol-blue/10'
                    : 'hover:bg-kol-surface-elevated/50'
                  }
                `}
              >
                <div className="w-9 h-9 rounded-lg bg-kol-surface-elevated flex items-center justify-center">
                  <i className="ri-global-line text-kol-text-muted" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">All Feeds</p>
                  <p className="text-xs text-kol-text-muted">Global settings</p>
                </div>
                {selectedGroupId === null && (
                  <i className="ri-check-line text-kol-blue" />
                )}
              </button>

              {/* Divider */}
              {groups.length > 0 && (
                <div className="h-px bg-kol-border/30 mx-4" />
              )}

              {/* Group Items */}
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleSelectGroup(group.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 transition-colors
                    ${selectedGroupId === group.id
                      ? 'bg-kol-blue/10'
                      : 'hover:bg-kol-surface-elevated/50'
                    }
                  `}
                >
                  <div className="w-9 h-9 rounded-lg bg-kol-surface-elevated flex items-center justify-center">
                    <i className={`${group.icon} text-kol-text-muted`} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">{group.name}</p>
                  </div>
                  <span className="text-xs text-kol-text-muted">
                    ({group.accounts.length})
                  </span>
                  {selectedGroupId === group.id && (
                    <i className="ri-check-line text-kol-blue" />
                  )}
                </button>
              ))}
            </div>

            {/* New Group Button */}
            <div className="border-t border-kol-border/30 p-4">
              <button
                onClick={handleCreateGroup}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-kol-surface border border-kol-border/50 text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated transition-colors"
              >
                <i className="ri-add-line" />
                <span className="text-sm font-medium">New Group</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}

export default GroupsBottomSheet
