import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
interface Account {
  id: string
  handle: string
  name: string
  avatar?: string
}

interface FeedGroup {
  id: string
  name: string
  icon: string
  accounts: Account[]
}

interface FeedGroupsModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mock data for groups
const MOCK_GROUPS: FeedGroup[] = [
  {
    id: '1',
    name: 'Alpha Callers',
    icon: 'ri-fire-line',
    accounts: [
      { id: '1', handle: 'crypto_alerts', name: 'CryptoAlerts', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: '2', handle: 'ZssBecker', name: 'Alex Becker', avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: '3', handle: 'defi_watcher', name: 'DeFiWatcher', avatar: 'https://i.pravatar.cc/150?img=5' },
    ],
  },
  {
    id: '2',
    name: 'Whale Trackers',
    icon: 'ri-bubble-chart-line',
    accounts: [
      { id: '4', handle: 'whale_alert', name: 'WhaleAlert', avatar: 'https://i.pravatar.cc/150?img=10' },
      { id: '5', handle: 'bundle_scan', name: 'BundleScanner', avatar: 'https://i.pravatar.cc/150?img=4' },
    ],
  },
  {
    id: '3',
    name: 'News & Media',
    icon: 'ri-newspaper-line',
    accounts: [
      { id: '6', handle: 'CoinDesk', name: 'CoinDesk', avatar: 'https://i.pravatar.cc/150?img=13' },
      { id: '7', handle: 'business', name: 'Bloomberg', avatar: 'https://i.pravatar.cc/150?img=12' },
    ],
  },
]

// Available icons for groups
const AVAILABLE_ICONS = [
  'ri-fire-line',
  'ri-bubble-chart-line',
  'ri-newspaper-line',
  'ri-star-line',
  'ri-vip-crown-line',
  'ri-flashlight-line',
  'ri-rocket-line',
  'ri-eye-line',
  'ri-target-line',
  'ri-compass-line',
  'ri-lightbulb-line',
  'ri-trophy-line',
]

export function FeedGroupsModal({ isOpen, onClose }: FeedGroupsModalProps) {
  const [groups, setGroups] = useState<FeedGroup[]>(MOCK_GROUPS)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [newAccountHandle, setNewAccountHandle] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleCreateGroup = () => {
    const newGroup: FeedGroup = {
      id: Date.now().toString(),
      name: 'New Group',
      icon: 'ri-star-line',
      accounts: [],
    }
    setGroups([...groups, newGroup])
    setSelectedGroupId(newGroup.id)
    setEditingGroupId(newGroup.id)
    setEditingName('New Group')
  }

  const handleDuplicateGroup = (group: FeedGroup) => {
    const duplicatedGroup: FeedGroup = {
      id: Date.now().toString(),
      name: `${group.name} (Copy)`,
      icon: group.icon,
      accounts: [...group.accounts],
    }
    setGroups([...groups, duplicatedGroup])
  }

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId))
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null)
    }
  }

  const handleRenameGroup = (groupId: string) => {
    setGroups(groups.map(g =>
      g.id === groupId ? { ...g, name: editingName } : g
    ))
    setEditingGroupId(null)
    setEditingName('')
  }

  const handleChangeIcon = (groupId: string, icon: string) => {
    setGroups(groups.map(g =>
      g.id === groupId ? { ...g, icon } : g
    ))
    setShowIconPicker(null)
  }

  const handleAddAccount = () => {
    if (!selectedGroupId || !newAccountHandle.trim()) return

    const newAccount: Account = {
      id: Date.now().toString(),
      handle: newAccountHandle.replace('@', ''),
      name: newAccountHandle.replace('@', ''),
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    }

    setGroups(groups.map(g =>
      g.id === selectedGroupId
        ? { ...g, accounts: [...g.accounts, newAccount] }
        : g
    ))
    setNewAccountHandle('')
    setShowAddAccount(false)
  }

  const handleRemoveAccount = (accountId: string) => {
    if (!selectedGroupId) return
    setGroups(groups.map(g =>
      g.id === selectedGroupId
        ? { ...g, accounts: g.accounts.filter(a => a.id !== accountId) }
        : g
    ))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-h-[600px] bg-kol-surface-elevated/95 backdrop-blur-xl border border-kol-border/60 rounded-2xl overflow-hidden z-50 flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-kol-border/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-kol-blue/10 border border-kol-blue/20 flex items-center justify-center">
                  <i className="ri-group-line text-kol-blue text-lg" />
                </div>
                <div>
                  <h2 className="font-body font-semibold text-white text-sm">Feed Groups</h2>
                  <p className="font-body text-xs text-kol-text-muted">Manage your tracked accounts</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-kol-surface/50 border border-kol-border/30 flex items-center justify-center text-kol-text-muted hover:text-white hover:border-kol-border/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="ri-close-line text-lg" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex flex-1 min-h-0">
              {/* Groups List */}
              <div className="w-[180px] border-r border-kol-border/30 flex flex-col">
                <div className="p-3 flex-1 overflow-y-auto">
                  <div className="space-y-1">
                    {groups.map((group) => (
                      <motion.div
                        key={group.id}
                        className="relative group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <button
                          onClick={() => setSelectedGroupId(group.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                            selectedGroupId === group.id
                              ? 'bg-kol-blue/15 border border-kol-blue/30 text-white'
                              : 'hover:bg-kol-surface/50 text-kol-text-secondary hover:text-white border border-transparent'
                          }`}
                        >
                          {/* Icon with picker */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowIconPicker(showIconPicker === group.id ? null : group.id)
                              }}
                              className="w-7 h-7 rounded-lg bg-kol-surface/60 border border-kol-border/40 flex items-center justify-center hover:border-kol-blue/40 transition-colors"
                            >
                              <i className={`${group.icon} text-sm ${selectedGroupId === group.id ? 'text-kol-blue' : 'text-kol-text-muted'}`} />
                            </button>

                            {/* Icon Picker Dropdown */}
                            <AnimatePresence>
                              {showIconPicker === group.id && (
                                <motion.div
                                  className="absolute left-0 top-full mt-1 p-2 bg-kol-surface-elevated border border-kol-border/50 rounded-xl z-10 grid grid-cols-4 gap-1"
                                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {AVAILABLE_ICONS.map((icon) => (
                                    <button
                                      key={icon}
                                      onClick={() => handleChangeIcon(group.id, icon)}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                        group.icon === icon
                                          ? 'bg-kol-blue/20 text-kol-blue'
                                          : 'hover:bg-kol-surface/80 text-kol-text-muted hover:text-white'
                                      }`}
                                    >
                                      <i className={`${icon} text-sm`} />
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="flex-1 min-w-0">
                            {editingGroupId === group.id ? (
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={() => handleRenameGroup(group.id)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRenameGroup(group.id)}
                                className="w-full bg-transparent border-b border-kol-blue/50 text-xs font-medium text-white focus:outline-none"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-xs font-medium truncate block">{group.name}</span>
                            )}
                            <span className="text-[10px] text-kol-text-muted">{group.accounts.length} accounts</span>
                          </div>
                        </button>

                        {/* Hover actions */}
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingGroupId(group.id)
                              setEditingName(group.name)
                            }}
                            className="w-5 h-5 rounded flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-kol-surface/60 transition-colors"
                            title="Rename"
                          >
                            <i className="ri-pencil-line text-[10px]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicateGroup(group)
                            }}
                            className="w-5 h-5 rounded flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-kol-surface/60 transition-colors"
                            title="Duplicate"
                          >
                            <i className="ri-file-copy-line text-[10px]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteGroup(group.id)
                            }}
                            className="w-5 h-5 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10 transition-colors"
                            title="Delete"
                          >
                            <i className="ri-delete-bin-line text-[10px]" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Add Group Button */}
                <div className="p-3 border-t border-kol-border/30">
                  <motion.button
                    onClick={handleCreateGroup}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-kol-blue/10 border border-kol-blue/20 text-kol-blue text-xs font-medium hover:bg-kol-blue/15 hover:border-kol-blue/30 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className="ri-add-line text-sm" />
                    New Group
                  </motion.button>
                </div>
              </div>

              {/* Group Details */}
              <div className="flex-1 flex flex-col min-h-0">
                {selectedGroup ? (
                  <>
                    {/* Group Header */}
                    <div className="px-4 py-3 border-b border-kol-border/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-kol-blue/10 border border-kol-blue/20 flex items-center justify-center">
                          <i className={`${selectedGroup.icon} text-kol-blue`} />
                        </div>
                        <div>
                          <h3 className="font-body font-semibold text-white text-sm">{selectedGroup.name}</h3>
                          <p className="font-body text-[10px] text-kol-text-muted">{selectedGroup.accounts.length} tracked accounts</p>
                        </div>
                      </div>
                    </div>

                    {/* Accounts List */}
                    <div className="flex-1 overflow-y-auto p-3">
                      <div className="space-y-1.5">
                        {selectedGroup.accounts.map((account) => (
                          <motion.div
                            key={account.id}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-kol-surface/40 border border-kol-border/30 group hover:border-kol-border/50 transition-colors"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <img
                              src={account.avatar}
                              alt={account.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-kol-border/40"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-body font-medium text-white text-xs truncate">{account.name}</p>
                              <p className="font-body text-[10px] text-kol-text-muted">@{account.handle}</p>
                            </div>
                            <motion.button
                              onClick={() => handleRemoveAccount(account.id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-kol-text-muted opacity-0 group-hover:opacity-100 hover:text-kol-red hover:bg-kol-red/10 transition-all"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className="ri-close-line text-sm" />
                            </motion.button>
                          </motion.div>
                        ))}

                        {selectedGroup.accounts.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-xl bg-kol-surface/50 border border-kol-border/30 flex items-center justify-center mb-3">
                              <i className="ri-user-add-line text-xl text-kol-text-muted" />
                            </div>
                            <p className="font-body text-xs text-kol-text-muted">No accounts in this group</p>
                            <p className="font-body text-[10px] text-kol-text-muted mt-0.5">Add accounts to start tracking</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add Account */}
                    <div className="p-3 border-t border-kol-border/30">
                      <AnimatePresence mode="wait">
                        {showAddAccount ? (
                          <motion.div
                            key="input"
                            className="flex gap-2"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                          >
                            <input
                              type="text"
                              value={newAccountHandle}
                              onChange={(e) => setNewAccountHandle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddAccount()}
                              placeholder="@username"
                              className="flex-1 h-9 px-3 rounded-lg bg-kol-surface/50 border border-kol-border/40 text-xs text-white placeholder:text-kol-text-muted font-body focus:outline-none focus:border-kol-blue/50 transition-colors"
                              autoFocus
                            />
                            <motion.button
                              onClick={handleAddAccount}
                              className="h-9 px-4 rounded-lg bg-kol-blue text-white text-xs font-medium hover:bg-kol-blue-hover transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Add
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                setShowAddAccount(false)
                                setNewAccountHandle('')
                              }}
                              className="h-9 w-9 rounded-lg bg-kol-surface/50 border border-kol-border/40 flex items-center justify-center text-kol-text-muted hover:text-white hover:border-kol-border/60 transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <i className="ri-close-line" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="button"
                            onClick={() => setShowAddAccount(true)}
                            className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-kol-surface/50 border border-kol-border/40 border-dashed text-kol-text-muted text-xs font-medium hover:text-white hover:border-kol-border/60 transition-colors"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <i className="ri-user-add-line text-sm" />
                            Add Account
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-14 h-14 rounded-2xl bg-kol-surface/50 border border-kol-border/30 flex items-center justify-center mb-4">
                      <i className="ri-folder-open-line text-2xl text-kol-text-muted" />
                    </div>
                    <h3 className="font-body font-semibold text-white text-sm mb-1">Select a group</h3>
                    <p className="font-body text-xs text-kol-text-muted max-w-[180px]">
                      Choose a group from the left to view and manage its accounts
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
