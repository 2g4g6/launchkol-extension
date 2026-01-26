import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseModal } from '../ui/BaseModal'

// ============================================================================
// Types
// ============================================================================

interface Account {
  id: string
  handle: string
  name: string
  avatar?: string
}

interface FeedGroupSettings {
  useGlobalSettings: boolean
  autoTranslate: boolean
  pauseOnHover: boolean
  notifications: boolean
  tweetTypes: {
    posts: boolean
    replies: boolean
    quotes: boolean
    reposts: boolean
  }
}

interface FeedGroup {
  id: string
  name: string
  icon: string
  accounts: Account[]
  settings: FeedGroupSettings
}

interface GlobalFeedSettings {
  autoTranslate: boolean
  pauseOnHover: boolean
  notifications: boolean
  tweetTypes: {
    posts: boolean
    replies: boolean
    quotes: boolean
    reposts: boolean
  }
}

export interface FeedSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  groups: 'launchkol_feed_groups',
  globalSettings: 'launchkol_global_feed_settings'
}

const DEFAULT_GLOBAL_SETTINGS: GlobalFeedSettings = {
  autoTranslate: false,
  pauseOnHover: false,
  notifications: true,
  tweetTypes: {
    posts: true,
    replies: true,
    quotes: true,
    reposts: true
  }
}

const DEFAULT_GROUP_SETTINGS: FeedGroupSettings = {
  useGlobalSettings: true,
  autoTranslate: false,
  pauseOnHover: false,
  notifications: true,
  tweetTypes: {
    posts: true,
    replies: true,
    quotes: true,
    reposts: true
  }
}

const GROUP_ICONS = [
  'ri-fire-line',
  'ri-line-chart-line',
  'ri-newspaper-line',
  'ri-star-line',
  'ri-vip-crown-line',
  'ri-rocket-line',
  'ri-flashlight-line',
  'ri-lightbulb-line',
  'ri-heart-line',
  'ri-bookmark-line'
]

// ============================================================================
// Helper Components
// ============================================================================

interface ToggleSwitchProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative w-9 h-5 rounded-full transition-colors
        ${enabled ? 'bg-kol-blue' : 'bg-kol-border'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <motion.div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
        animate={{ left: enabled ? 18 : 2 }}
        transition={{ duration: 0.15 }}
      />
    </button>
  )
}

interface TweetTypePillProps {
  label: string
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

function TweetTypePill({ label, enabled, onChange, disabled }: TweetTypePillProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        h-6 px-2.5 rounded text-xs font-medium transition-colors border
        ${enabled
          ? 'bg-kol-blue/15 text-kol-blue border-kol-blue/50'
          : 'bg-kol-surface/45 border-kol-border text-kol-text-muted hover:bg-kol-surface-elevated'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {label}
    </button>
  )
}

interface IconPickerProps {
  currentIcon: string
  onSelect: (icon: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function IconPicker({ currentIcon, onSelect, isOpen, onOpenChange }: IconPickerProps) {
  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!isOpen)}
        className="w-8 h-8 rounded-lg bg-kol-surface border border-kol-border flex items-center justify-center hover:border-kol-text-muted transition-colors"
      >
        <i className={`${currentIcon} text-kol-text-secondary`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 p-2 bg-kol-bg border border-kol-border rounded-lg shadow-xl z-10 grid grid-cols-5 gap-1"
          >
            {GROUP_ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => {
                  onSelect(icon)
                  onOpenChange(false)
                }}
                className={`
                  w-7 h-7 rounded flex items-center justify-center transition-colors
                  ${icon === currentIcon
                    ? 'bg-kol-blue/20 text-kol-blue'
                    : 'hover:bg-kol-surface text-kol-text-muted hover:text-white'
                  }
                `}
              >
                <i className={`${icon} text-sm`} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function FeedSettingsModal({ isOpen, onClose }: FeedSettingsModalProps) {
  const [groups, setGroups] = useState<FeedGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'accounts' | 'settings'>('accounts')
  const [globalSettings, setGlobalSettings] = useState<GlobalFeedSettings>(DEFAULT_GLOBAL_SETTINGS)
  const [accountSearchQuery, setAccountSearchQuery] = useState('')
  const [newAccountHandle, setNewAccountHandle] = useState('')
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')
  const [iconPickerGroupId, setIconPickerGroupId] = useState<string | null>(null)

  // Load from storage on mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEYS.groups, STORAGE_KEYS.globalSettings], (result) => {
        if (result[STORAGE_KEYS.groups]) {
          setGroups(result[STORAGE_KEYS.groups])
        }
        if (result[STORAGE_KEYS.globalSettings]) {
          setGlobalSettings(result[STORAGE_KEYS.globalSettings])
        }
      })
    }
  }, [])

  // Save groups to storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && groups.length > 0) {
      chrome.storage.local.set({ [STORAGE_KEYS.groups]: groups })
    }
  }, [groups])

  // Save global settings to storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [STORAGE_KEYS.globalSettings]: globalSettings })
    }
  }, [globalSettings])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedGroupId(null)
      setSelectedTab('accounts')
      setAccountSearchQuery('')
      setNewAccountHandle('')
      setEditingGroupId(null)
      setIconPickerGroupId(null)
    }
  }, [isOpen])

  // Get selected group
  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  // Group CRUD operations
  const createGroup = () => {
    const newGroup: FeedGroup = {
      id: `group-${Date.now()}`,
      name: 'New Group',
      icon: 'ri-star-line',
      accounts: [],
      settings: { ...DEFAULT_GROUP_SETTINGS }
    }
    setGroups([...groups, newGroup])
    setSelectedGroupId(newGroup.id)
    setEditingGroupId(newGroup.id)
    setEditingGroupName(newGroup.name)
  }

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId))
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null)
    }
  }

  const renameGroup = (groupId: string, newName: string) => {
    setGroups(groups.map(g =>
      g.id === groupId ? { ...g, name: newName } : g
    ))
    setEditingGroupId(null)
  }

  const updateGroupIcon = (groupId: string, icon: string) => {
    setGroups(groups.map(g =>
      g.id === groupId ? { ...g, icon } : g
    ))
  }

  // Account operations
  const addAccount = (groupId: string) => {
    if (!newAccountHandle.trim()) return

    const newAccount: Account = {
      id: `account-${Date.now()}`,
      handle: newAccountHandle.trim().replace('@', ''),
      name: newAccountHandle.trim().replace('@', '')
    }

    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, accounts: [...g.accounts, newAccount] }
        : g
    ))
    setNewAccountHandle('')
  }

  const removeAccount = (groupId: string, accountId: string) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, accounts: g.accounts.filter(a => a.id !== accountId) }
        : g
    ))
  }

  // Settings operations
  const updateGroupSettings = (groupId: string, updates: Partial<FeedGroupSettings>) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, settings: { ...g.settings, ...updates } }
        : g
    ))
  }

  const updateGroupTweetTypes = (groupId: string, type: keyof FeedGroupSettings['tweetTypes'], value: boolean) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? {
            ...g,
            settings: {
              ...g.settings,
              tweetTypes: { ...g.settings.tweetTypes, [type]: value }
            }
          }
        : g
    ))
  }

  const updateGlobalTweetTypes = (type: keyof GlobalFeedSettings['tweetTypes'], value: boolean) => {
    setGlobalSettings({
      ...globalSettings,
      tweetTypes: { ...globalSettings.tweetTypes, [type]: value }
    })
  }

  // Get effective settings for a group (respecting useGlobalSettings)
  const getEffectiveSettings = (group: FeedGroup) => {
    if (group.settings.useGlobalSettings) {
      return globalSettings
    }
    return group.settings
  }

  // Filter accounts by search
  const filteredAccounts = selectedGroup
    ? selectedGroup.accounts.filter(a =>
        a.handle.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(accountSearchQuery.toLowerCase())
      )
    : []

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Feed Settings"
      width="w-[520px]"
    >
      <div className="flex gap-4 h-[380px] -mx-4 -mb-4">
        {/* Left Column - Groups Sidebar */}
        <div className="w-[160px] flex flex-col border-r border-kol-border pl-4 pr-3 py-1">
          {/* All Feeds (Global) */}
          <button
            onClick={() => {
              setSelectedGroupId(null)
              setSelectedTab('settings')
            }}
            className={`
              flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors
              ${selectedGroupId === null
                ? 'bg-kol-blue/10 text-white'
                : 'text-kol-text-secondary hover:bg-kol-surface hover:text-white'
              }
            `}
          >
            <i className="ri-global-line text-sm" />
            <span className="text-xs font-medium truncate">All Feeds</span>
          </button>

          {/* Divider */}
          <div className="h-px bg-kol-border my-2" />

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-styled">
            {groups.map(group => (
              <div
                key={group.id}
                className="group relative"
              >
                <button
                  onClick={() => {
                    setSelectedGroupId(group.id)
                    setSelectedTab('accounts')
                  }}
                  className={`
                    w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors
                    ${selectedGroupId === group.id
                      ? 'bg-kol-blue/10 text-white'
                      : 'text-kol-text-secondary hover:bg-kol-surface hover:text-white'
                    }
                  `}
                >
                  <div className="relative">
                    {iconPickerGroupId === group.id ? (
                      <IconPicker
                        currentIcon={group.icon}
                        isOpen={true}
                        onOpenChange={(open) => !open && setIconPickerGroupId(null)}
                        onSelect={(icon) => updateGroupIcon(group.id, icon)}
                      />
                    ) : (
                      <i
                        className={`${group.icon} text-sm cursor-pointer hover:text-kol-blue`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIconPickerGroupId(group.id)
                        }}
                      />
                    )}
                  </div>

                  {editingGroupId === group.id ? (
                    <input
                      type="text"
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      onBlur={() => renameGroup(group.id, editingGroupName)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameGroup(group.id, editingGroupName)
                        if (e.key === 'Escape') setEditingGroupId(null)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="flex-1 bg-transparent text-xs font-medium outline-none border-b border-kol-blue min-w-0"
                    />
                  ) : (
                    <span className="text-xs font-medium truncate flex-1">{group.name}</span>
                  )}

                  <span className="text-[10px] text-kol-text-muted">{group.accounts.length}</span>
                </button>

                {/* Edit/Delete on hover */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingGroupId(group.id)
                      setEditingGroupName(group.name)
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center text-kol-text-muted hover:text-white hover:bg-kol-surface"
                  >
                    <i className="ri-pencil-line text-[10px]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteGroup(group.id)
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10"
                  >
                    <i className="ri-delete-bin-line text-[10px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New Group Button */}
          <button
            onClick={createGroup}
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-kol-text-muted hover:text-white hover:bg-kol-surface transition-colors mt-2"
          >
            <i className="ri-add-line text-sm" />
            <span className="text-xs font-medium">New Group</span>
          </button>
        </div>

        {/* Right Column - Tab Content */}
        <div className="flex-1 flex flex-col pr-4 py-1 min-w-0">
          {/* Tab Bar (only show for groups, not global) */}
          {selectedGroupId !== null && (
            <div className="flex gap-1 mb-3 p-1 bg-kol-surface rounded-lg">
              <button
                onClick={() => setSelectedTab('accounts')}
                className={`
                  flex-1 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${selectedTab === 'accounts'
                    ? 'bg-kol-bg text-white'
                    : 'text-kol-text-muted hover:text-white'
                  }
                `}
              >
                Accounts
              </button>
              <button
                onClick={() => setSelectedTab('settings')}
                className={`
                  flex-1 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${selectedTab === 'settings'
                    ? 'bg-kol-bg text-white'
                    : 'text-kol-text-muted hover:text-white'
                  }
                `}
              >
                Settings
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-styled">
            {/* Global Settings (All Feeds selected) */}
            {selectedGroupId === null && (
              <div className="space-y-4">
                <div className="text-xs text-kol-text-muted mb-4">
                  These settings apply to all groups that have "Use global settings" enabled.
                </div>

                {/* Toggle Settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Auto-translate tweets</p>
                      <p className="text-xs text-kol-text-muted">Automatically translate non-English tweets</p>
                    </div>
                    <ToggleSwitch
                      enabled={globalSettings.autoTranslate}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, autoTranslate: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Pause feed on hover</p>
                      <p className="text-xs text-kol-text-muted">Stop auto-scrolling when hovering over feed</p>
                    </div>
                    <ToggleSwitch
                      enabled={globalSettings.pauseOnHover}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, pauseOnHover: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Desktop notifications</p>
                      <p className="text-xs text-kol-text-muted">Get notified about new tweets</p>
                    </div>
                    <ToggleSwitch
                      enabled={globalSettings.notifications}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, notifications: v })}
                    />
                  </div>
                </div>

                {/* Tweet Types */}
                <div className="pt-2">
                  <p className="text-sm text-white mb-2">Tweet types to show</p>
                  <div className="flex flex-wrap gap-2">
                    <TweetTypePill
                      label="Posts"
                      enabled={globalSettings.tweetTypes.posts}
                      onChange={(v) => updateGlobalTweetTypes('posts', v)}
                    />
                    <TweetTypePill
                      label="Replies"
                      enabled={globalSettings.tweetTypes.replies}
                      onChange={(v) => updateGlobalTweetTypes('replies', v)}
                    />
                    <TweetTypePill
                      label="Quotes"
                      enabled={globalSettings.tweetTypes.quotes}
                      onChange={(v) => updateGlobalTweetTypes('quotes', v)}
                    />
                    <TweetTypePill
                      label="Reposts"
                      enabled={globalSettings.tweetTypes.reposts}
                      onChange={(v) => updateGlobalTweetTypes('reposts', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Tab */}
            {selectedGroupId !== null && selectedTab === 'accounts' && selectedGroup && (
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-kol-text-muted text-sm" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={accountSearchQuery}
                    onChange={(e) => setAccountSearchQuery(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 rounded-md bg-kol-surface border border-kol-border text-sm text-white placeholder:text-kol-text-muted/50 focus:outline-none focus:border-kol-blue/50 focus:ring-1 focus:ring-kol-blue/30 transition-colors"
                  />
                </div>

                {/* Accounts List */}
                <div className="space-y-1">
                  {filteredAccounts.length === 0 && !accountSearchQuery ? (
                    <div className="text-center py-8 text-kol-text-muted">
                      <i className="ri-user-add-line text-2xl mb-2 block" />
                      <p className="text-sm">No accounts yet</p>
                      <p className="text-xs">Add accounts to track their tweets</p>
                    </div>
                  ) : filteredAccounts.length === 0 ? (
                    <div className="text-center py-4 text-kol-text-muted">
                      <p className="text-sm">No accounts match "{accountSearchQuery}"</p>
                    </div>
                  ) : (
                    filteredAccounts.map(account => (
                      <div
                        key={account.id}
                        className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-kol-surface transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-kol-surface-elevated flex items-center justify-center overflow-hidden">
                          {account.avatar ? (
                            <img src={account.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <i className="ri-user-line text-kol-text-muted" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{account.name}</p>
                          <p className="text-xs text-kol-text-muted">@{account.handle}</p>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeAccount(selectedGroupId, account.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10 transition-all"
                        >
                          <i className="ri-close-line text-sm" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Account */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="@username"
                    value={newAccountHandle}
                    onChange={(e) => setNewAccountHandle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addAccount(selectedGroupId)
                    }}
                    className="flex-1 h-9 px-3 rounded-md bg-kol-surface border border-kol-border text-sm text-white placeholder:text-kol-text-muted/50 focus:outline-none focus:border-kol-blue/50 focus:ring-1 focus:ring-kol-blue/30 transition-colors"
                  />
                  <button
                    onClick={() => addAccount(selectedGroupId)}
                    disabled={!newAccountHandle.trim()}
                    className={`
                      px-3 h-9 rounded-md text-xs font-medium transition-colors
                      ${newAccountHandle.trim()
                        ? 'bg-kol-blue hover:bg-kol-blue-hover text-white'
                        : 'bg-kol-surface border border-kol-border text-kol-text-muted cursor-not-allowed'
                      }
                    `}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {selectedGroupId !== null && selectedTab === 'settings' && selectedGroup && (
              <div className="space-y-4">
                {/* Use Global Settings Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-kol-border">
                  <div>
                    <p className="text-sm text-white">Use global settings</p>
                    <p className="text-xs text-kol-text-muted">Override with group-specific settings when disabled</p>
                  </div>
                  <ToggleSwitch
                    enabled={selectedGroup.settings.useGlobalSettings}
                    onChange={(v) => updateGroupSettings(selectedGroupId, { useGlobalSettings: v })}
                  />
                </div>

                {/* Group-specific Settings */}
                <div className={selectedGroup.settings.useGlobalSettings ? 'opacity-50 pointer-events-none' : ''}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Auto-translate tweets</p>
                        <p className="text-xs text-kol-text-muted">Automatically translate non-English tweets</p>
                      </div>
                      <ToggleSwitch
                        enabled={getEffectiveSettings(selectedGroup).autoTranslate}
                        onChange={(v) => updateGroupSettings(selectedGroupId, { autoTranslate: v })}
                        disabled={selectedGroup.settings.useGlobalSettings}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Pause feed on hover</p>
                        <p className="text-xs text-kol-text-muted">Stop auto-scrolling when hovering</p>
                      </div>
                      <ToggleSwitch
                        enabled={getEffectiveSettings(selectedGroup).pauseOnHover}
                        onChange={(v) => updateGroupSettings(selectedGroupId, { pauseOnHover: v })}
                        disabled={selectedGroup.settings.useGlobalSettings}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Desktop notifications</p>
                        <p className="text-xs text-kol-text-muted">Get notified about new tweets</p>
                      </div>
                      <ToggleSwitch
                        enabled={getEffectiveSettings(selectedGroup).notifications}
                        onChange={(v) => updateGroupSettings(selectedGroupId, { notifications: v })}
                        disabled={selectedGroup.settings.useGlobalSettings}
                      />
                    </div>
                  </div>

                  {/* Tweet Types */}
                  <div className="pt-3">
                    <p className="text-sm text-white mb-2">Tweet types to show</p>
                    <div className="flex flex-wrap gap-2">
                      <TweetTypePill
                        label="Posts"
                        enabled={getEffectiveSettings(selectedGroup).tweetTypes.posts}
                        onChange={(v) => updateGroupTweetTypes(selectedGroupId, 'posts', v)}
                        disabled={selectedGroup.settings.useGlobalSettings}
                      />
                      <TweetTypePill
                        label="Replies"
                        enabled={getEffectiveSettings(selectedGroup).tweetTypes.replies}
                        onChange={(v) => updateGroupTweetTypes(selectedGroupId, 'replies', v)}
                        disabled={selectedGroup.settings.useGlobalSettings}
                      />
                      <TweetTypePill
                        label="Quotes"
                        enabled={getEffectiveSettings(selectedGroup).tweetTypes.quotes}
                        onChange={(v) => updateGroupTweetTypes(selectedGroupId, 'quotes', v)}
                        disabled={selectedGroup.settings.useGlobalSettings}
                      />
                      <TweetTypePill
                        label="Reposts"
                        enabled={getEffectiveSettings(selectedGroup).tweetTypes.reposts}
                        onChange={(v) => updateGroupTweetTypes(selectedGroupId, 'reposts', v)}
                        disabled={selectedGroup.settings.useGlobalSettings}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  )
}

export default FeedSettingsModal
