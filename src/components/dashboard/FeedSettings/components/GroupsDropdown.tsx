import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FeedGroup } from '../types'
import { IconPicker } from './IconPicker'

export interface GroupsDropdownProps {
  isOpen: boolean
  onClose: () => void
  groups: FeedGroup[]
  selectedGroupId: string | null
  onSelectGroup: (groupId: string | null) => void
  onCreateGroup: () => void
  onRenameGroup?: (groupId: string, newName: string) => void
  onDeleteGroup?: (groupId: string) => void
  onUpdateGroupIcon?: (groupId: string, icon: string) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

export function GroupsDropdown({
  isOpen,
  onClose,
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onUpdateGroupIcon,
  triggerRef,
}: GroupsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing
  useEffect(() => {
    if (editingGroupId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingGroupId])

  // Reset editing state when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setEditingGroupId(null)
      setEditingGroupName('')
    }
  }, [isOpen])

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
        if (editingGroupId) {
          setEditingGroupId(null)
          setEditingGroupName('')
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, editingGroupId])

  const handleSelectGroup = (groupId: string | null) => {
    if (editingGroupId) return // Don't select while editing
    onSelectGroup(groupId)
    onClose()
  }

  const handleCreateGroup = () => {
    onCreateGroup()
    onClose()
  }

  const handleStartEdit = (e: React.MouseEvent, groupId: string, currentName: string) => {
    e.stopPropagation()
    setEditingGroupId(groupId)
    setEditingGroupName(currentName)
  }

  const handleSaveEdit = (groupId: string) => {
    if (editingGroupName.trim() && onRenameGroup) {
      onRenameGroup(groupId, editingGroupName.trim())
    }
    setEditingGroupId(null)
    setEditingGroupName('')
  }

  const handleDelete = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation()
    if (onDeleteGroup) {
      onDeleteGroup(groupId)
    }
  }

  const handleIconChange = (groupId: string, icon: string) => {
    if (onUpdateGroupIcon) {
      onUpdateGroupIcon(groupId, icon)
    }
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
                w-full flex items-center gap-3 px-3 py-2.5 max-sm:py-3 transition-colors
                ${selectedGroupId === null
                  ? 'bg-kol-blue/10'
                  : 'hover:bg-kol-surface-elevated/50'
                }
              `}
            >
              <div className="w-8 h-8 max-sm:w-10 max-sm:h-10 rounded-lg bg-kol-surface-elevated flex items-center justify-center flex-shrink-0">
                <i className="ri-global-line text-sm text-kol-text-muted" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm max-sm:text-base font-medium text-white">All Feeds</p>
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
              <div
                key={group.id}
                onClick={() => handleSelectGroup(group.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 max-sm:py-3 transition-colors cursor-pointer
                  ${selectedGroupId === group.id
                    ? 'bg-kol-blue/10'
                    : 'hover:bg-kol-surface-elevated/50'
                  }
                `}
              >
                {/* Icon picker */}
                <div
                  className="w-8 h-8 max-sm:w-10 max-sm:h-10 rounded-lg bg-kol-surface-elevated flex items-center justify-center flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onUpdateGroupIcon ? (
                    <IconPicker
                      currentIcon={group.icon}
                      onSelect={(icon) => handleIconChange(group.id, icon)}
                    />
                  ) : (
                    <i className={`${group.icon} text-sm text-kol-text-muted`} />
                  )}
                </div>

                {/* Name / Edit input */}
                <div className="flex-1 text-left min-w-0">
                  {editingGroupId === group.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      onBlur={() => handleSaveEdit(group.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(group.id)
                        } else if (e.key === 'Escape') {
                          setEditingGroupId(null)
                          setEditingGroupName('')
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent text-sm max-sm:text-base font-medium text-white outline-none border-b border-kol-blue"
                    />
                  ) : (
                    <p className="text-sm max-sm:text-base font-medium text-white truncate">{group.name}</p>
                  )}
                </div>

                {/* Account count - only show when not editing */}
                {editingGroupId !== group.id && (
                  <span className="text-[10px] text-kol-text-muted flex-shrink-0">
                    {group.accounts.length}
                  </span>
                )}

                {/* Edit/Delete buttons */}
                {(onRenameGroup || onDeleteGroup) && editingGroupId !== group.id && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {onRenameGroup && (
                      <button
                        onClick={(e) => handleStartEdit(e, group.id, group.name)}
                        className="w-8 h-8 rounded flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-kol-surface transition-colors"
                      >
                        <i className="ri-pencil-line text-sm" />
                      </button>
                    )}
                    {onDeleteGroup && (
                      <button
                        onClick={(e) => handleDelete(e, group.id)}
                        className="w-8 h-8 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10 transition-colors"
                      >
                        <i className="ri-delete-bin-line text-sm" />
                      </button>
                    )}
                  </div>
                )}

                {/* Selected check */}
                {selectedGroupId === group.id && editingGroupId !== group.id && (
                  <i className="ri-check-line text-kol-blue flex-shrink-0" />
                )}
              </div>
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
