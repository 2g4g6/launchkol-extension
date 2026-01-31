import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseModal } from '../../ui/BaseModal'
import { Tooltip } from '../../ui/Tooltip'

import type {
  PlatformType,
  TweetTypeKey,
  TweetTypeSettings,
  AccountSettings,
  Account,
  FeedGroupSettings,
  FeedGroup,
  GlobalFeedSettings,
  FeedSettingsModalProps,
  ContentFilters,
} from './types'

import {
  STORAGE_KEYS,
  TWEET_TYPE_LABELS,
  PLATFORM_OPTIONS,
  createDefaultTweetTypeSettings,
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_GROUP_SETTINGS,
  LANGUAGES,
  TARGET_LANGUAGES,
} from './constants'

import {
  migrateGroupSettings,
  migrateAccountSettings,
  migrateGlobalSettings,
} from './migrations'

import {
  ToggleSwitch,
  LanguageSelect,
  IconPicker,
  PlatformSelect,
  VolumeSlider,
  KeywordInput,
  TweetTypeRow,
  PlatformPicker,
  MobileGroupTrigger,
  GroupsDropdown,
  ColorPicker,
  SoundPicker,
} from './components'

import {
  DEFAULT_TOKEN_SYMBOLS_COLOR,
  DEFAULT_MINT_ADDRESSES_COLOR,
  DEFAULT_TOKEN_SYMBOLS_NOTIFICATION,
  DEFAULT_MINT_ADDRESSES_NOTIFICATION,
} from './constants'

// Helper to build a complete ContentFilters object with notification defaults
function buildFilters(existing: ContentFilters | undefined, overrides: Partial<ContentFilters>): ContentFilters {
  return {
    filterTokenSymbols: existing?.filterTokenSymbols ?? false,
    tokenSymbolsColor: existing?.tokenSymbolsColor ?? DEFAULT_TOKEN_SYMBOLS_COLOR,
    tokenSymbolsNotification: existing?.tokenSymbolsNotification ?? { ...DEFAULT_TOKEN_SYMBOLS_NOTIFICATION },
    filterMintAddresses: existing?.filterMintAddresses ?? false,
    mintAddressesColor: existing?.mintAddressesColor ?? DEFAULT_MINT_ADDRESSES_COLOR,
    mintAddressesNotification: existing?.mintAddressesNotification ?? { ...DEFAULT_MINT_ADDRESSES_NOTIFICATION },
    keywords: existing?.keywords ?? [],
    ...overrides,
  }
}

export function FeedSettingsModal({ isOpen, onClose }: FeedSettingsModalProps) {
  const [groups, setGroups] = useState<FeedGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'accounts' | 'settings'>('accounts')
  const [globalSettings, setGlobalSettings] = useState<GlobalFeedSettings>(DEFAULT_GLOBAL_SETTINGS)
  const [accountSearchQuery, setAccountSearchQuery] = useState('')
  const [newAccountHandle, setNewAccountHandle] = useState('')
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')
  const [isAccountSearchFocused, setIsAccountSearchFocused] = useState(false)
  const [isNewAccountFocused, setIsNewAccountFocused] = useState(false)
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }
  const isSectionOpen = (key: string) => expandedSections.has(key)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load from storage on mount and migrate old data
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEYS.groups, STORAGE_KEYS.globalSettings], (result) => {
        if (result[STORAGE_KEYS.groups]) {
          // Migrate groups and their accounts
          const loadedGroups = result[STORAGE_KEYS.groups] as FeedGroup[]
          const migratedGroups = loadedGroups.map(group => ({
            ...group,
            settings: migrateGroupSettings(group.settings as unknown as Record<string, unknown>),
            accounts: group.accounts.map(account => ({
              ...account,
              settings: migrateAccountSettings(account.settings as unknown as Record<string, unknown> | undefined),
            })),
          }))
          setGroups(migratedGroups)
        }
        if (result[STORAGE_KEYS.globalSettings]) {
          const migratedGlobal = migrateGlobalSettings(result[STORAGE_KEYS.globalSettings] as Record<string, unknown>)
          setGlobalSettings(migratedGlobal)
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
      setExpandedAccountId(null)
    }
  }, [isOpen])

  // Get selected group
  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  // Display settings: shows global values when useGlobalSettings is on, otherwise group's own values
  const displaySettings = selectedGroup
    ? (selectedGroup.settings.useGlobalSettings ? globalSettings : selectedGroup.settings)
    : null

  // Group CRUD operations
  const createGroup = () => {
    const newGroup: FeedGroup = {
      id: `group-${Date.now()}`,
      name: 'New Group',
      icon: 'ri-star-line',
      accounts: [],
      settings: {
        ...DEFAULT_GROUP_SETTINGS,
        tweetTypes: createDefaultTweetTypeSettings(),
      }
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

  // Update a specific tweet type setting for a group
  const updateGroupTweetType = (groupId: string, typeKey: TweetTypeKey, updates: Partial<TweetTypeSettings>) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? {
            ...g,
            settings: {
              ...g.settings,
              tweetTypes: {
                ...g.settings.tweetTypes,
                [typeKey]: { ...g.settings.tweetTypes[typeKey], ...updates }
              }
            }
          }
        : g
    ))
  }

  // Update a specific tweet type setting for global
  const updateGlobalTweetType = (typeKey: TweetTypeKey, updates: Partial<TweetTypeSettings>) => {
    setGlobalSettings({
      ...globalSettings,
      tweetTypes: {
        ...globalSettings.tweetTypes,
        [typeKey]: { ...globalSettings.tweetTypes[typeKey], ...updates }
      }
    })
  }

  // Update group filters
  const updateGroupFilters = (groupId: string, filters: ContentFilters) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, settings: { ...g.settings, filters } }
        : g
    ))
  }

  // Get effective settings for a group (respecting useGlobalSettings)
  const getEffectiveSettings = (group: FeedGroup): FeedGroupSettings | GlobalFeedSettings => {
    if (group.settings.useGlobalSettings) {
      return globalSettings
    }
    return group.settings
  }

  // Update settings for a specific account
  const updateAccountSettings = (groupId: string, accountId: string, updates: Partial<AccountSettings>) => {
    setGroups(groups.map(g => {
      if (g.id !== groupId) return g
      return {
        ...g,
        accounts: g.accounts.map(a => {
          if (a.id !== accountId) return a
          return {
            ...a,
            settings: { ...a.settings, ...updates }
          }
        })
      }
    }))
  }

  // Update a specific tweet type for an account
  const updateAccountTweetType = (
    groupId: string,
    accountId: string,
    typeKey: TweetTypeKey,
    updates: Partial<TweetTypeSettings>
  ) => {
    setGroups(groups.map(g => {
      if (g.id !== groupId) return g
      return {
        ...g,
        accounts: g.accounts.map(a => {
          if (a.id !== accountId) return a
          const currentTweetTypes = a.settings?.tweetTypes || {}
          const currentTypeSettings = currentTweetTypes[typeKey] || {}
          return {
            ...a,
            settings: {
              ...a.settings,
              tweetTypes: {
                ...currentTweetTypes,
                [typeKey]: { ...currentTypeSettings, ...updates }
              }
            }
          }
        })
      }
    }))
  }

  // Update account filters
  const updateAccountFilters = (groupId: string, accountId: string, filters: ContentFilters) => {
    updateAccountSettings(groupId, accountId, { filters })
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
      width="w-[680px]"
      fullScreenMobile
    >
      <div className="flex h-[460px] max-sm:h-[calc(100vh-56px)] -mx-4 -mt-4 -mb-4 max-sm:flex-col overflow-hidden">
        {/* Mobile Group Trigger */}
        {isMobile && (
          <div className="p-3 border-b border-kol-border/50 flex-shrink-0 relative">
            <MobileGroupTrigger
              ref={triggerRef}
              selectedGroup={selectedGroup || null}
              isOpen={isDropdownOpen}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
            <GroupsDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(groupId) => {
                setSelectedGroupId(groupId)
                if (groupId === null) {
                  setSelectedTab('settings')
                } else {
                  setSelectedTab('accounts')
                }
              }}
              onCreateGroup={createGroup}
              onRenameGroup={renameGroup}
              onDeleteGroup={deleteGroup}
              onUpdateGroupIcon={updateGroupIcon}
              triggerRef={triggerRef}
            />
          </div>
        )}

        {/* Left Column - Groups Sidebar (Desktop only) */}
        <div
          className={`${sidebarExpanded ? 'w-[200px]' : 'w-[48px]'} flex flex-col border-r border-kol-border/50 bg-kol-surface/30 max-sm:hidden transition-[width] duration-200 ease-in-out overflow-hidden flex-shrink-0`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          {/* All Feeds (Global) */}
          <button
            onClick={() => {
              setSelectedGroupId(null)
              setSelectedTab('settings')
            }}
            className={`
              w-full flex items-center justify-center gap-2.5 px-3 py-2.5 text-left transition-all mt-1
              ${selectedGroupId === null
                ? 'bg-kol-blue/10 text-white border-l-2 border-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated/50 hover:text-white border-l-2 border-transparent'
              }
            `}
          >
            <i className="ri-global-line text-sm flex-shrink-0" />
            {sidebarExpanded && <span className="text-xs font-medium whitespace-nowrap">All Feeds</span>}
          </button>

          {/* Divider */}
          <div className="h-px bg-kol-border/50 mx-3 my-2" />

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-styled">
            {groups.map(group => (
              <div
                key={group.id}
                className="group relative"
              >
                <div
                  onClick={() => {
                    if (!sidebarExpanded) {
                      setSelectedGroupId(group.id)
                      setSelectedTab('accounts')
                    }
                  }}
                  className={`
                    w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-0'} py-2.5 transition-all ${sidebarExpanded ? 'group-hover:pr-12' : ''} ${!sidebarExpanded ? 'cursor-pointer' : ''}
                    ${selectedGroupId === group.id
                      ? 'bg-kol-blue/10 text-white border-l-2 border-kol-blue'
                      : 'text-kol-text-muted hover:bg-kol-surface-elevated/50 hover:text-white border-l-2 border-transparent'
                    }
                  `}
                >
                  <IconPicker
                    currentIcon={group.icon}
                    onSelect={(icon) => updateGroupIcon(group.id, icon)}
                  />

                  {sidebarExpanded && (
                    editingGroupId === group.id ? (
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
                      <button
                        onClick={() => {
                          setSelectedGroupId(group.id)
                          setSelectedTab('accounts')
                        }}
                        className="flex-1 text-left text-xs font-medium truncate min-w-0"
                      >
                        {group.name}
                      </button>
                    )
                  )}

                  {sidebarExpanded && <span className="text-[10px] text-kol-text-muted group-hover:opacity-0 transition-opacity">{group.accounts.length}</span>}
                </div>

                {/* Edit/Delete on hover */}
                {sidebarExpanded && <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                  <Tooltip content="Rename group" position="top">
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
                  </Tooltip>
                  <Tooltip content="Delete group" position="top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteGroup(group.id)
                      }}
                      className="w-5 h-5 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10"
                    >
                      <i className="ri-delete-bin-line text-[10px]" />
                    </button>
                  </Tooltip>
                </div>}
              </div>
            ))}
          </div>

          {/* New Group Button */}
          <Tooltip content="Create new feed group" position="right">
            <button
              onClick={createGroup}
              className="flex items-center justify-center gap-2.5 px-3 py-2.5 text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated/50 transition-colors border-t border-kol-border/30 w-full"
            >
              <i className="ri-add-line text-sm flex-shrink-0" />
              {sidebarExpanded && <span className="text-xs font-medium whitespace-nowrap">New Group</span>}
            </button>
          </Tooltip>
        </div>

        {/* Right Column - Tab Content */}
        <div className="flex-1 flex flex-col p-4 min-w-0 max-sm:min-h-0 max-sm:overflow-hidden">
          {/* Tab Bar (only show for groups, not global) */}
          {selectedGroupId !== null && (
            <div className="pb-3 mb-3 border-b border-kol-border/30">
              <div className="flex gap-1 p-1 bg-kol-surface/50 rounded-lg border border-kol-border/30">
                <button
                  onClick={() => setSelectedTab('accounts')}
                  className={`
                    flex-1 py-2 rounded-md text-xs font-medium transition-all
                    ${selectedTab === 'accounts'
                      ? 'bg-kol-bg text-white shadow-sm'
                      : 'text-kol-text-muted hover:text-white'
                    }
                  `}
                >
                  <i className="ri-user-line mr-1.5" />
                  Accounts
                </button>
                <button
                  onClick={() => setSelectedTab('settings')}
                  className={`
                    flex-1 py-2 rounded-md text-xs font-medium transition-all
                    ${selectedTab === 'settings'
                      ? 'bg-kol-bg text-white shadow-sm'
                      : 'text-kol-text-muted hover:text-white'
                    }
                  `}
                >
                  <i className="ri-settings-3-line mr-1.5" />
                  Settings
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Global Settings (All Feeds selected) */}
            {selectedGroupId === null && (
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-styled space-y-5 pr-3">
                <div className="p-3 rounded-lg bg-kol-surface/30 border border-kol-border/30">
                  <p className="text-xs text-kol-text-muted">
                    <i className="ri-information-line mr-1.5" />
                    These settings apply to all groups that have "Use global settings" enabled.
                  </p>
                </div>

                {/* General Settings Section */}
                <div>
                  <button
                    onClick={() => toggleSection('global-general')}
                    className="w-full flex items-center justify-between group/section cursor-pointer"
                  >
                    <span className="text-[10px] max-sm:text-xs text-kol-text-muted uppercase tracking-wide font-medium flex items-center gap-1.5">
                      <i className="ri-settings-3-line" />
                      General Settings
                    </span>
                    <motion.i
                      animate={{ rotate: isSectionOpen('global-general') ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                      className="ri-arrow-down-s-line text-kol-text-muted text-sm"
                    />
                  </button>
                </div>

                {/* Toggle Settings */}
                <AnimatePresence initial={false}>
                  {isSectionOpen('global-general') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1">
                      <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                        <i className="ri-translate-2 text-kol-text-muted" />
                        Auto-translate tweets
                      </p>
                      <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Translate tweets to your preferred language</p>
                    </div>
                    <ToggleSwitch
                      enabled={globalSettings.autoTranslate}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, autoTranslate: v })}
                    />
                  </div>

                  {/* Language Selection - shown when auto-translate is enabled */}
                  <AnimatePresence>
                    {globalSettings.autoTranslate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 pl-0 py-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium mb-1.5 block">From</label>
                            <LanguageSelect
                              value={globalSettings.translateFrom}
                              onChange={(v) => setGlobalSettings({ ...globalSettings, translateFrom: v })}
                              options={LANGUAGES}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium mb-1.5 block">To</label>
                            <LanguageSelect
                              value={globalSettings.translateTo}
                              onChange={(v) => setGlobalSettings({ ...globalSettings, translateTo: v })}
                              options={TARGET_LANGUAGES}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1">
                      <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                        <i className="ri-pause-circle-line text-kol-text-muted" />
                        Pause feed on hover
                      </p>
                      <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Stop auto-scrolling when hovering</p>
                    </div>
                    <ToggleSwitch
                      enabled={globalSettings.pauseOnHover}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, pauseOnHover: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1">
                      <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                        <i className="ri-rocket-line text-kol-text-muted" />
                        Default Launch Platform
                      </p>
                      <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Platform to open coins on</p>
                    </div>
                    <PlatformSelect
                      value={globalSettings.defaultLaunchPlatform}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, defaultLaunchPlatform: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1">
                    <div>
                      <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                        <i className="ri-volume-up-line text-kol-text-muted" />
                        Sound Volume
                      </p>
                      <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Volume for notification sounds</p>
                    </div>
                    <VolumeSlider
                      value={globalSettings.soundVolume}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, soundVolume: v })}
                    />
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filters Section */}
                <div className="pt-2 border-t border-kol-border/20">
                  <div className="mb-3">
                    <button
                      onClick={() => toggleSection('global-filters')}
                      className="w-full flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-[10px] max-sm:text-xs text-kol-text-muted uppercase tracking-wide font-medium flex items-center gap-1.5">
                        <i className="ri-filter-3-line" />
                        Highlight Filters
                      </span>
                      <motion.i
                        animate={{ rotate: isSectionOpen('global-filters') ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                        className="ri-arrow-down-s-line text-kol-text-muted text-sm"
                      />
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {isSectionOpen('global-filters') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <div className="flex-1">
                        <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                          <i className="ri-coin-line text-kol-text-muted" />
                          Token Symbols
                        </p>
                        <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Highlight tweets with $TOKEN mentions</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {(globalSettings.filters?.filterTokenSymbols ?? false) && (<>
                          <Tooltip content="Desktop notification" position="top">
                            <button
                              onClick={() => {
                                const notif = globalSettings.filters?.tokenSymbolsNotification ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION
                                setGlobalSettings({
                                  ...globalSettings,
                                  filters: buildFilters(globalSettings.filters, {
                                    tokenSymbolsNotification: { ...notif, desktop: !notif.desktop },
                                  }),
                                })
                              }}
                              className={`
                                w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                ${(globalSettings.filters?.tokenSymbolsNotification?.desktop ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.desktop)
                                  ? 'text-kol-blue bg-kol-blue/10'
                                  : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                }
                              `}
                            >
                              <i className={(globalSettings.filters?.tokenSymbolsNotification?.desktop ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.desktop) ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
                            </button>
                          </Tooltip>
                          <Tooltip content="Sound notification" position="top">
                            <button
                              onClick={() => {
                                const notif = globalSettings.filters?.tokenSymbolsNotification ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION
                                setGlobalSettings({
                                  ...globalSettings,
                                  filters: buildFilters(globalSettings.filters, {
                                    tokenSymbolsNotification: { ...notif, sound: !notif.sound },
                                  }),
                                })
                              }}
                              className={`
                                w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                ${(globalSettings.filters?.tokenSymbolsNotification?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound)
                                  ? 'text-kol-blue bg-kol-blue/10'
                                  : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                }
                              `}
                            >
                              <i className={(globalSettings.filters?.tokenSymbolsNotification?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound) ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
                            </button>
                          </Tooltip>
                          <SoundPicker
                            currentSound={globalSettings.filters?.tokenSymbolsNotification?.soundId ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.soundId}
                            onSelect={(soundId) => {
                              const notif = globalSettings.filters?.tokenSymbolsNotification ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION
                              setGlobalSettings({
                                ...globalSettings,
                                filters: buildFilters(globalSettings.filters, {
                                  tokenSymbolsNotification: { ...notif, soundId },
                                }),
                              })
                            }}
                            enabled={globalSettings.filters?.tokenSymbolsNotification?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound}
                          />
                          <ColorPicker
                            currentColor={globalSettings.filters?.tokenSymbolsColor ?? DEFAULT_TOKEN_SYMBOLS_COLOR}
                            onSelect={(color) => setGlobalSettings({
                              ...globalSettings,
                              filters: buildFilters(globalSettings.filters, { tokenSymbolsColor: color }),
                            })}
                          />
                        </>)}
                        <ToggleSwitch
                          enabled={globalSettings.filters?.filterTokenSymbols ?? false}
                          onChange={(v) => setGlobalSettings({
                            ...globalSettings,
                            filters: buildFilters(globalSettings.filters, { filterTokenSymbols: v }),
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="flex-1">
                        <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                          <i className="ri-file-code-line text-kol-text-muted" />
                          Mint Addresses
                        </p>
                        <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Highlight tweets with contract addresses</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {(globalSettings.filters?.filterMintAddresses ?? false) && (<>
                          <Tooltip content="Desktop notification" position="top">
                            <button
                              onClick={() => {
                                const notif = globalSettings.filters?.mintAddressesNotification ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION
                                setGlobalSettings({
                                  ...globalSettings,
                                  filters: buildFilters(globalSettings.filters, {
                                    mintAddressesNotification: { ...notif, desktop: !notif.desktop },
                                  }),
                                })
                              }}
                              className={`
                                w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                ${(globalSettings.filters?.mintAddressesNotification?.desktop ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.desktop)
                                  ? 'text-kol-blue bg-kol-blue/10'
                                  : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                }
                              `}
                            >
                              <i className={(globalSettings.filters?.mintAddressesNotification?.desktop ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.desktop) ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
                            </button>
                          </Tooltip>
                          <Tooltip content="Sound notification" position="top">
                            <button
                              onClick={() => {
                                const notif = globalSettings.filters?.mintAddressesNotification ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION
                                setGlobalSettings({
                                  ...globalSettings,
                                  filters: buildFilters(globalSettings.filters, {
                                    mintAddressesNotification: { ...notif, sound: !notif.sound },
                                  }),
                                })
                              }}
                              className={`
                                w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                ${(globalSettings.filters?.mintAddressesNotification?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound)
                                  ? 'text-kol-blue bg-kol-blue/10'
                                  : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                }
                              `}
                            >
                              <i className={(globalSettings.filters?.mintAddressesNotification?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound) ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
                            </button>
                          </Tooltip>
                          <SoundPicker
                            currentSound={globalSettings.filters?.mintAddressesNotification?.soundId ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.soundId}
                            onSelect={(soundId) => {
                              const notif = globalSettings.filters?.mintAddressesNotification ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION
                              setGlobalSettings({
                                ...globalSettings,
                                filters: buildFilters(globalSettings.filters, {
                                  mintAddressesNotification: { ...notif, soundId },
                                }),
                              })
                            }}
                            enabled={globalSettings.filters?.mintAddressesNotification?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound}
                          />
                          <ColorPicker
                            currentColor={globalSettings.filters?.mintAddressesColor ?? DEFAULT_MINT_ADDRESSES_COLOR}
                            onSelect={(color) => setGlobalSettings({
                              ...globalSettings,
                              filters: buildFilters(globalSettings.filters, { mintAddressesColor: color }),
                            })}
                          />
                        </>)}
                        <ToggleSwitch
                          enabled={globalSettings.filters?.filterMintAddresses ?? false}
                          onChange={(v) => setGlobalSettings({
                            ...globalSettings,
                            filters: buildFilters(globalSettings.filters, { filterMintAddresses: v }),
                          })}
                        />
                      </div>
                    </div>
                    <KeywordInput
                      keywords={globalSettings.filters?.keywords ?? []}
                      onChange={(v) => setGlobalSettings({
                        ...globalSettings,
                        filters: buildFilters(globalSettings.filters, { keywords: v }),
                      })}
                    />
                  </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tweet Types Section */}
                <div className="pt-2 border-t border-kol-border/20">
                  <div className="mb-2">
                    <button
                      onClick={() => toggleSection('global-tweets')}
                      className="w-full flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-[10px] max-sm:text-xs text-kol-text-muted uppercase tracking-wide font-medium flex items-center gap-1.5">
                        <i className="ri-chat-3-line" />
                        Tweet Types
                      </span>
                      <motion.i
                        animate={{ rotate: isSectionOpen('global-tweets') ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                        className="ri-arrow-down-s-line text-kol-text-muted text-sm"
                      />
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {isSectionOpen('global-tweets') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                  <div className="space-y-0.5">
                    {(Object.keys(TWEET_TYPE_LABELS) as TweetTypeKey[]).map(typeKey => (
                      <TweetTypeRow
                        key={typeKey}
                        typeKey={typeKey}
                        label={TWEET_TYPE_LABELS[typeKey]}
                        settings={globalSettings.tweetTypes[typeKey]}
                        groupDefaults={globalSettings.tweetTypes[typeKey]}
                        onChange={(updates) => updateGlobalTweetType(typeKey, updates)}
                        accountDefaultPlatform={PLATFORM_OPTIONS.find(p => p.id === globalSettings.defaultLaunchPlatform)?.label}
                      />
                    ))}
                  </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Accounts Tab */}
            {selectedGroupId !== null && selectedTab === 'accounts' && selectedGroup && (
              <div className="flex flex-col h-full">
                {/* Search - Fixed at top */}
                <div className="relative flex-shrink-0 mb-3">
                  {/* Focus glow effect */}
                  <div
                    className={`absolute inset-0 rounded-lg transition-opacity duration-500 blur-xl -z-10 ${
                      isAccountSearchFocused ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(0, 123, 255, 0.15) 0%, transparent 70%)',
                    }}
                  />
                  <i className={`ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 ${
                    isAccountSearchFocused ? 'text-kol-blue' : 'text-kol-text-muted'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={accountSearchQuery}
                    onChange={(e) => setAccountSearchQuery(e.target.value)}
                    onFocus={() => setIsAccountSearchFocused(true)}
                    onBlur={() => setIsAccountSearchFocused(false)}
                    className={`w-full h-9 max-sm:h-11 pl-8 pr-3 rounded-lg bg-kol-surface/50 border text-sm text-white placeholder:text-kol-text-muted/50 focus:outline-none transition-all duration-300 ${
                      isAccountSearchFocused ? 'border-kol-blue/50' : 'border-kol-border/50'
                    }`}
                  />
                </div>

                {/* Accounts List - Scrollable middle section */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-styled min-h-0 pr-3">
                  <div className="space-y-1">
                    {filteredAccounts.length === 0 && !accountSearchQuery ? (
                      <motion.div
                        className="flex flex-col items-center justify-center py-12 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="relative mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-kol-surface-elevated/50 backdrop-blur-sm border border-kol-border/40 flex items-center justify-center">
                            <i className="ri-user-add-line text-2xl text-kol-text-muted" />
                          </div>
                          <div
                            className="absolute inset-0 rounded-2xl opacity-50 blur-xl -z-10"
                            style={{
                              background: 'radial-gradient(circle, rgba(0, 123, 255, 0.15) 0%, transparent 70%)',
                            }}
                          />
                          <motion.div
                            className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-kol-blue/30"
                            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-kol-green/30"
                            animate={{ y: [0, -3, 0], opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">No accounts yet</h3>
                        <p className="text-xs text-kol-text-muted max-w-[180px]">Add Twitter accounts to track in this group</p>
                      </motion.div>
                    ) : filteredAccounts.length === 0 ? (
                      <motion.div
                        className="flex flex-col items-center justify-center py-8 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="relative mb-3">
                          <div className="w-12 h-12 rounded-xl bg-kol-surface-elevated/30 flex items-center justify-center">
                            <i className="ri-search-line text-xl text-kol-text-muted" />
                          </div>
                          <div
                            className="absolute inset-0 rounded-xl opacity-40 blur-lg -z-10"
                            style={{
                              background: 'radial-gradient(circle, rgba(136, 136, 136, 0.1) 0%, transparent 70%)',
                            }}
                          />
                        </div>
                        <p className="text-sm text-kol-text-muted">No accounts match "<span className="text-white">{accountSearchQuery}</span>"</p>
                      </motion.div>
                    ) : (
                      filteredAccounts.map(account => {
                        const isExpanded = expandedAccountId === account.id
                        const hasCustomSettings = account.settings && Object.keys(account.settings).length > 0
                        const groupSettings = getEffectiveSettings(selectedGroup)
                        const accountDefaultPlatform = account.settings?.defaultLaunchPlatform || groupSettings.defaultLaunchPlatform

                        return (
                          <div
                            key={account.id}
                            className={`rounded-lg transition-colors ${isExpanded ? 'bg-kol-surface/50 border border-kol-border/30' : ''}`}
                          >
                            {/* Account Row - Clickable to expand */}
                            <div
                              className={`group flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                                isExpanded ? '' : 'hover:bg-kol-surface-elevated/50 rounded-lg'
                              }`}
                              onClick={() => setExpandedAccountId(isExpanded ? null : account.id)}
                            >
                              {/* Avatar */}
                              <div className="w-8 h-8 rounded-full bg-kol-surface-elevated flex items-center justify-center overflow-hidden ring-1 ring-kol-border/50">
                                {account.avatar ? (
                                  <img src={account.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <i className="ri-user-line text-kol-text-muted" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{account.name}</p>
                                <p className="text-xs text-kol-text-muted">@{account.handle}</p>
                              </div>

                              {/* Custom settings indicator */}
                              {hasCustomSettings && !isExpanded && (
                                <Tooltip content="Has custom settings" position="top">
                                  <div className="w-5 h-5 rounded flex items-center justify-center text-kol-blue">
                                    <i className="ri-settings-3-line text-xs" />
                                  </div>
                                </Tooltip>
                              )}

                              {/* Expand/collapse chevron */}
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-5 h-5 rounded flex items-center justify-center text-kol-text-muted"
                              >
                                <i className="ri-arrow-down-s-line text-sm" />
                              </motion.div>

                              {/* Remove button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeAccount(selectedGroupId, account.id)
                                }}
                                className="w-6 h-6 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10 transition-all"
                              >
                                <i className="ri-close-line text-sm" />
                              </button>
                            </div>

                            {/* Expanded Settings Panel */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 pt-1 space-y-4">
                                    {/* Divider */}
                                    <div className="h-px bg-kol-border/30" />

                                    {/* General Settings Section */}
                                    <div>
                                      <div className="mb-2">
                                        <button
                                          onClick={() => toggleSection(`account-${account.id}-general`)}
                                          className="w-full flex items-center justify-between cursor-pointer"
                                        >
                                          <span className="text-[9px] text-kol-text-muted uppercase tracking-wide font-medium flex items-center gap-1">
                                            <i className="ri-settings-3-line" />
                                            General Settings
                                          </span>
                                          <motion.i
                                            animate={{ rotate: isSectionOpen(`account-${account.id}-general`) ? 0 : -90 }}
                                            transition={{ duration: 0.2 }}
                                            className="ri-arrow-down-s-line text-kol-text-muted text-xs"
                                          />
                                        </button>
                                      </div>

                                      <AnimatePresence initial={false}>
                                        {isSectionOpen(`account-${account.id}-general`) && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                      <div className="space-y-3">
                                        {/* Auto-translate */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <i className="ri-translate-2 text-kol-text-muted text-xs" />
                                            <p className="text-xs font-medium text-white">Auto-translate</p>
                                          </div>
                                          <ToggleSwitch
                                            enabled={account.settings?.autoTranslate ?? groupSettings.autoTranslate}
                                            onChange={(v) => updateAccountSettings(selectedGroupId, account.id, { autoTranslate: v })}
                                          />
                                        </div>

                                        {/* Language Selection - shown when auto-translate is enabled */}
                                        <AnimatePresence>
                                          {(account.settings?.autoTranslate ?? groupSettings.autoTranslate) && (
                                            <motion.div
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: 'auto' }}
                                              exit={{ opacity: 0, height: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="flex gap-3 py-1">
                                                <div className="flex-1">
                                                  <label className="text-[9px] text-kol-text-muted uppercase tracking-wide font-medium mb-1 block">From</label>
                                                  <LanguageSelect
                                                    value={account.settings?.translateFrom ?? groupSettings.translateFrom}
                                                    onChange={(v) => updateAccountSettings(selectedGroupId, account.id, { translateFrom: v })}
                                                    options={LANGUAGES}
                                                  />
                                                </div>
                                                <div className="flex-1">
                                                  <label className="text-[9px] text-kol-text-muted uppercase tracking-wide font-medium mb-1 block">To</label>
                                                  <LanguageSelect
                                                    value={account.settings?.translateTo ?? groupSettings.translateTo}
                                                    onChange={(v) => updateAccountSettings(selectedGroupId, account.id, { translateTo: v })}
                                                    options={TARGET_LANGUAGES}
                                                  />
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>

                                        {/* Default Launch Platform */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <i className="ri-rocket-line text-kol-text-muted text-xs" />
                                            <p className="text-xs font-medium text-white">Default Launch Platform</p>
                                          </div>
                                          <PlatformPicker
                                            currentPlatform={account.settings?.defaultLaunchPlatform || null}
                                            onSelect={(platform) => updateAccountSettings(selectedGroupId, account.id, {
                                              defaultLaunchPlatform: platform as PlatformType | undefined
                                            })}
                                            accountDefault={PLATFORM_OPTIONS.find(p => p.id === groupSettings.defaultLaunchPlatform)?.label}
                                          />
                                        </div>

                                        {/* Sound Volume */}
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="flex items-center gap-1.5">
                                            <i className="ri-volume-up-line text-kol-text-muted text-xs" />
                                            <p className="text-xs font-medium text-white">Sound Volume</p>
                                          </div>
                                          <VolumeSlider
                                            value={account.settings?.soundVolume ?? groupSettings.soundVolume}
                                            onChange={(v) => updateAccountSettings(selectedGroupId, account.id, { soundVolume: v })}
                                          />
                                        </div>
                                      </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* Filters Section */}
                                    <div>
                                      <div className="mb-2">
                                        <button
                                          onClick={() => toggleSection(`account-${account.id}-filters`)}
                                          className="w-full flex items-center justify-between cursor-pointer"
                                        >
                                          <span className="text-[9px] text-kol-text-muted uppercase tracking-wide font-medium flex items-center gap-1">
                                            <i className="ri-filter-3-line" />
                                            Highlight Filters
                                          </span>
                                          <motion.i
                                            animate={{ rotate: isSectionOpen(`account-${account.id}-filters`) ? 0 : -90 }}
                                            transition={{ duration: 0.2 }}
                                            className="ri-arrow-down-s-line text-kol-text-muted text-xs"
                                          />
                                        </button>
                                      </div>

                                      <AnimatePresence initial={false}>
                                        {isSectionOpen(`account-${account.id}-filters`) && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <i className="ri-coin-line text-kol-text-muted text-xs" />
                                            <p className="text-xs font-medium text-white">Token Symbols</p>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            {(account.settings?.filters?.filterTokenSymbols ?? groupSettings.filters?.filterTokenSymbols ?? false) && (<>
                                              <Tooltip content="Desktop notification" position="top">
                                                <button
                                                  onClick={() => {
                                                    const notif = account.settings?.filters?.tokenSymbolsNotification ?? groupSettings.filters?.tokenSymbolsNotification ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION
                                                    updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, {
                                                      tokenSymbolsNotification: { ...notif, desktop: !notif.desktop },
                                                    }))
                                                  }}
                                                  className={`
                                                    w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                                    ${(account.settings?.filters?.tokenSymbolsNotification?.desktop ?? groupSettings.filters?.tokenSymbolsNotification?.desktop ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.desktop)
                                                      ? 'text-kol-blue bg-kol-blue/10'
                                                      : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                                    }
                                                  `}
                                                >
                                                  <i className={(account.settings?.filters?.tokenSymbolsNotification?.desktop ?? groupSettings.filters?.tokenSymbolsNotification?.desktop ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.desktop) ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
                                                </button>
                                              </Tooltip>
                                              <Tooltip content="Sound notification" position="top">
                                                <button
                                                  onClick={() => {
                                                    const notif = account.settings?.filters?.tokenSymbolsNotification ?? groupSettings.filters?.tokenSymbolsNotification ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION
                                                    updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, {
                                                      tokenSymbolsNotification: { ...notif, sound: !notif.sound },
                                                    }))
                                                  }}
                                                  className={`
                                                    w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                                    ${(account.settings?.filters?.tokenSymbolsNotification?.sound ?? groupSettings.filters?.tokenSymbolsNotification?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound)
                                                      ? 'text-kol-blue bg-kol-blue/10'
                                                      : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                                    }
                                                  `}
                                                >
                                                  <i className={(account.settings?.filters?.tokenSymbolsNotification?.sound ?? groupSettings.filters?.tokenSymbolsNotification?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound) ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
                                                </button>
                                              </Tooltip>
                                              <SoundPicker
                                                currentSound={account.settings?.filters?.tokenSymbolsNotification?.soundId ?? groupSettings.filters?.tokenSymbolsNotification?.soundId ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.soundId}
                                                onSelect={(soundId) => {
                                                  const notif = account.settings?.filters?.tokenSymbolsNotification ?? groupSettings.filters?.tokenSymbolsNotification ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION
                                                  updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, {
                                                    tokenSymbolsNotification: { ...notif, soundId },
                                                  }))
                                                }}
                                                enabled={account.settings?.filters?.tokenSymbolsNotification?.sound ?? groupSettings.filters?.tokenSymbolsNotification?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound}
                                              />
                                              <ColorPicker
                                                currentColor={account.settings?.filters?.tokenSymbolsColor ?? groupSettings.filters?.tokenSymbolsColor ?? DEFAULT_TOKEN_SYMBOLS_COLOR}
                                                onSelect={(color) => updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, { tokenSymbolsColor: color }))}
                                              />
                                            </>)}
                                            <ToggleSwitch
                                              enabled={account.settings?.filters?.filterTokenSymbols ?? groupSettings.filters?.filterTokenSymbols ?? false}
                                              onChange={(v) => updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, { filterTokenSymbols: v }))}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <i className="ri-file-code-line text-kol-text-muted text-xs" />
                                            <p className="text-xs font-medium text-white">Mint Addresses</p>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            {(account.settings?.filters?.filterMintAddresses ?? groupSettings.filters?.filterMintAddresses ?? false) && (<>
                                              <Tooltip content="Desktop notification" position="top">
                                                <button
                                                  onClick={() => {
                                                    const notif = account.settings?.filters?.mintAddressesNotification ?? groupSettings.filters?.mintAddressesNotification ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION
                                                    updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, {
                                                      mintAddressesNotification: { ...notif, desktop: !notif.desktop },
                                                    }))
                                                  }}
                                                  className={`
                                                    w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                                    ${(account.settings?.filters?.mintAddressesNotification?.desktop ?? groupSettings.filters?.mintAddressesNotification?.desktop ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.desktop)
                                                      ? 'text-kol-blue bg-kol-blue/10'
                                                      : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                                    }
                                                  `}
                                                >
                                                  <i className={(account.settings?.filters?.mintAddressesNotification?.desktop ?? groupSettings.filters?.mintAddressesNotification?.desktop ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.desktop) ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
                                                </button>
                                              </Tooltip>
                                              <Tooltip content="Sound notification" position="top">
                                                <button
                                                  onClick={() => {
                                                    const notif = account.settings?.filters?.mintAddressesNotification ?? groupSettings.filters?.mintAddressesNotification ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION
                                                    updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, {
                                                      mintAddressesNotification: { ...notif, sound: !notif.sound },
                                                    }))
                                                  }}
                                                  className={`
                                                    w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                                    ${(account.settings?.filters?.mintAddressesNotification?.sound ?? groupSettings.filters?.mintAddressesNotification?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound)
                                                      ? 'text-kol-blue bg-kol-blue/10'
                                                      : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                                    }
                                                  `}
                                                >
                                                  <i className={(account.settings?.filters?.mintAddressesNotification?.sound ?? groupSettings.filters?.mintAddressesNotification?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound) ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
                                                </button>
                                              </Tooltip>
                                              <SoundPicker
                                                currentSound={account.settings?.filters?.mintAddressesNotification?.soundId ?? groupSettings.filters?.mintAddressesNotification?.soundId ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.soundId}
                                                onSelect={(soundId) => {
                                                  const notif = account.settings?.filters?.mintAddressesNotification ?? groupSettings.filters?.mintAddressesNotification ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION
                                                  updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, {
                                                    mintAddressesNotification: { ...notif, soundId },
                                                  }))
                                                }}
                                                enabled={account.settings?.filters?.mintAddressesNotification?.sound ?? groupSettings.filters?.mintAddressesNotification?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound}
                                              />
                                              <ColorPicker
                                                currentColor={account.settings?.filters?.mintAddressesColor ?? groupSettings.filters?.mintAddressesColor ?? DEFAULT_MINT_ADDRESSES_COLOR}
                                                onSelect={(color) => updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, { mintAddressesColor: color }))}
                                              />
                                            </>)}
                                            <ToggleSwitch
                                              enabled={account.settings?.filters?.filterMintAddresses ?? groupSettings.filters?.filterMintAddresses ?? false}
                                              onChange={(v) => updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, { filterMintAddresses: v }))}
                                            />
                                          </div>
                                        </div>
                                        <KeywordInput
                                          keywords={account.settings?.filters?.keywords ?? groupSettings.filters?.keywords ?? []}
                                          onChange={(v) => updateAccountFilters(selectedGroupId, account.id, buildFilters(account.settings?.filters, { keywords: v }))}
                                        />
                                      </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* Tweet Types Section */}
                                    <div>
                                      <div className="mb-2">
                                        <button
                                          onClick={() => toggleSection(`account-${account.id}-tweets`)}
                                          className="w-full flex items-center justify-between cursor-pointer"
                                        >
                                          <span className="text-[9px] text-kol-text-muted uppercase tracking-wide font-medium flex items-center gap-1">
                                            <i className="ri-chat-3-line" />
                                            Tweet Types
                                          </span>
                                          <motion.i
                                            animate={{ rotate: isSectionOpen(`account-${account.id}-tweets`) ? 0 : -90 }}
                                            transition={{ duration: 0.2 }}
                                            className="ri-arrow-down-s-line text-kol-text-muted text-xs"
                                          />
                                        </button>
                                      </div>

                                      <AnimatePresence initial={false}>
                                        {isSectionOpen(`account-${account.id}-tweets`) && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                      <div className="space-y-0.5">
                                        {(Object.keys(TWEET_TYPE_LABELS) as TweetTypeKey[]).map(typeKey => (
                                          <TweetTypeRow
                                            key={typeKey}
                                            typeKey={typeKey}
                                            label={TWEET_TYPE_LABELS[typeKey]}
                                            settings={account.settings?.tweetTypes?.[typeKey]}
                                            groupDefaults={groupSettings.tweetTypes[typeKey]}
                                            onChange={(updates) => updateAccountTweetType(selectedGroupId, account.id, typeKey, updates)}
                                            accountDefaultPlatform={PLATFORM_OPTIONS.find(p => p.id === accountDefaultPlatform)?.label}
                                          />
                                        ))}
                                      </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Add Account - Fixed at bottom */}
                <div className="flex-shrink-0 pt-3 mt-3 border-t border-kol-border/30">
                  <div className="flex gap-2 relative">
                    {/* Focus glow effect */}
                    <div
                      className={`absolute inset-0 rounded-lg transition-opacity duration-500 blur-xl -z-10 ${
                        isNewAccountFocused ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        background: 'radial-gradient(circle at 30% 50%, rgba(0, 123, 255, 0.15) 0%, transparent 70%)',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="@username"
                      value={newAccountHandle}
                      onChange={(e) => setNewAccountHandle(e.target.value)}
                      onFocus={() => setIsNewAccountFocused(true)}
                      onBlur={() => setIsNewAccountFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addAccount(selectedGroupId)
                      }}
                      className={`flex-1 h-9 max-sm:h-11 px-3 rounded-lg bg-kol-surface/50 border text-sm text-white placeholder:text-kol-text-muted/50 focus:outline-none transition-all duration-300 ${
                        isNewAccountFocused ? 'border-kol-blue/50' : 'border-kol-border/50'
                      }`}
                    />
                    <button
                      onClick={() => addAccount(selectedGroupId)}
                      disabled={!newAccountHandle.trim()}
                      className={`
                        px-4 max-sm:px-5 h-9 max-sm:h-11 rounded-lg text-xs font-medium transition-all
                        ${newAccountHandle.trim()
                          ? 'bg-kol-blue hover:bg-kol-blue-hover text-white shadow-[0_0_12px_rgba(0,123,255,0.3)]'
                          : 'bg-kol-surface border border-kol-border/50 text-kol-text-muted cursor-not-allowed'
                        }
                      `}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {selectedGroupId !== null && selectedTab === 'settings' && selectedGroup && (
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-styled space-y-5 pr-3">
                {/* Use Global Settings Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-kol-surface/30 border border-kol-border/30">
                  <div className="flex-1">
                    <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                      <i className="ri-global-line text-kol-text-muted" />
                      Use global settings
                    </p>
                    <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Override with group-specific settings when disabled</p>
                  </div>
                  <ToggleSwitch
                    enabled={selectedGroup.settings.useGlobalSettings}
                    onChange={(v) => updateGroupSettings(selectedGroupId, { useGlobalSettings: v })}
                  />
                </div>

                {/* Group-specific Settings */}
                <div className={selectedGroup.settings.useGlobalSettings ? 'opacity-40 pointer-events-none' : ''}>
                  {/* General Settings Section */}
                  <div className="mb-4">
                    <div className="mb-3">
                      <button
                        onClick={() => toggleSection('group-general')}
                        className="w-full flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-[10px] max-sm:text-xs text-kol-text-muted uppercase tracking-wide font-medium flex items-center gap-1.5">
                          <i className="ri-settings-3-line" />
                          General Settings
                        </span>
                        <motion.i
                          animate={{ rotate: isSectionOpen('group-general') ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                          className="ri-arrow-down-s-line text-kol-text-muted text-sm"
                        />
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {isSectionOpen('group-general') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1">
                          <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                            <i className="ri-translate-2 text-kol-text-muted" />
                            Auto-translate tweets
                          </p>
                          <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Translate tweets to your preferred language</p>
                        </div>
                        <ToggleSwitch
                          enabled={displaySettings?.autoTranslate ?? false}
                          onChange={(v) => updateGroupSettings(selectedGroupId, { autoTranslate: v })}
                          disabled={selectedGroup.settings.useGlobalSettings}
                        />
                      </div>

                      {/* Language Selection - shown when auto-translate is enabled */}
                      <AnimatePresence>
                        {displaySettings?.autoTranslate && !selectedGroup.settings.useGlobalSettings && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="flex gap-4 pl-0 py-2">
                              <div className="flex-1">
                                <label className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium mb-1.5 block">From</label>
                                <LanguageSelect
                                  value={displaySettings?.translateFrom ?? 'auto'}
                                  onChange={(v) => updateGroupSettings(selectedGroupId, { translateFrom: v })}
                                  options={LANGUAGES}
                                  disabled={selectedGroup.settings.useGlobalSettings}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium mb-1.5 block">To</label>
                                <LanguageSelect
                                  value={displaySettings?.translateTo ?? 'en'}
                                  onChange={(v) => updateGroupSettings(selectedGroupId, { translateTo: v })}
                                  options={TARGET_LANGUAGES}
                                  disabled={selectedGroup.settings.useGlobalSettings}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1">
                          <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                            <i className="ri-pause-circle-line text-kol-text-muted" />
                            Pause feed on hover
                          </p>
                          <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Stop auto-scrolling when hovering</p>
                        </div>
                        <ToggleSwitch
                          enabled={displaySettings?.pauseOnHover ?? false}
                          onChange={(v) => updateGroupSettings(selectedGroupId, { pauseOnHover: v })}
                          disabled={selectedGroup.settings.useGlobalSettings}
                        />
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1">
                          <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                            <i className="ri-rocket-line text-kol-text-muted" />
                            Default Launch Platform
                          </p>
                          <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Platform to open coins on</p>
                        </div>
                        <PlatformSelect
                          value={displaySettings?.defaultLaunchPlatform ?? 'pump'}
                          onChange={(v) => updateGroupSettings(selectedGroupId, { defaultLaunchPlatform: v })}
                          disabled={selectedGroup.settings.useGlobalSettings}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 py-1">
                        <div>
                          <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                            <i className="ri-volume-up-line text-kol-text-muted" />
                            Sound Volume
                          </p>
                          <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Volume for notification sounds</p>
                        </div>
                        <VolumeSlider
                          value={displaySettings?.soundVolume ?? 50}
                          onChange={(v) => updateGroupSettings(selectedGroupId, { soundVolume: v })}
                        />
                      </div>
                    </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Filters Section */}
                  <div className="mb-4 pt-2 border-t border-kol-border/20">
                    <div className="mb-3">
                      <button
                        onClick={() => toggleSection('group-filters')}
                        className="w-full flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-[10px] max-sm:text-xs text-kol-text-muted uppercase tracking-wide font-medium flex items-center gap-1.5">
                          <i className="ri-filter-3-line" />
                          Highlight Filters
                        </span>
                        <motion.i
                          animate={{ rotate: isSectionOpen('group-filters') ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                          className="ri-arrow-down-s-line text-kol-text-muted text-sm"
                        />
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {isSectionOpen('group-filters') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1">
                          <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                            <i className="ri-coin-line text-kol-text-muted" />
                            Token Symbols
                          </p>
                          <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Highlight tweets with $TOKEN mentions</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(displaySettings?.filters?.filterTokenSymbols ?? false) && !selectedGroup.settings.useGlobalSettings && (<>
                            <Tooltip content="Desktop notification" position="top">
                              <button
                                onClick={() => {
                                  const notif = selectedGroup.settings.filters?.tokenSymbolsNotification ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION
                                  updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, {
                                    tokenSymbolsNotification: { ...notif, desktop: !notif.desktop },
                                  }))
                                }}
                                className={`
                                  w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                  ${(displaySettings?.filters?.tokenSymbolsNotification?.desktop ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.desktop)
                                    ? 'text-kol-blue bg-kol-blue/10'
                                    : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                  }
                                `}
                              >
                                <i className={(displaySettings?.filters?.tokenSymbolsNotification?.desktop ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.desktop) ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
                              </button>
                            </Tooltip>
                            <Tooltip content="Sound notification" position="top">
                              <button
                                onClick={() => {
                                  const notif = selectedGroup.settings.filters?.tokenSymbolsNotification ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION
                                  updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, {
                                    tokenSymbolsNotification: { ...notif, sound: !notif.sound },
                                  }))
                                }}
                                className={`
                                  w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                  ${(displaySettings?.filters?.tokenSymbolsNotification?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound)
                                    ? 'text-kol-blue bg-kol-blue/10'
                                    : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                  }
                                `}
                              >
                                <i className={(displaySettings?.filters?.tokenSymbolsNotification?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound) ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
                              </button>
                            </Tooltip>
                            <SoundPicker
                              currentSound={displaySettings?.filters?.tokenSymbolsNotification?.soundId ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.soundId}
                              onSelect={(soundId) => {
                                const notif = selectedGroup.settings.filters?.tokenSymbolsNotification ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION
                                updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, {
                                  tokenSymbolsNotification: { ...notif, soundId },
                                }))
                              }}
                              enabled={displaySettings?.filters?.tokenSymbolsNotification?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound}
                            />
                            <ColorPicker
                              currentColor={displaySettings?.filters?.tokenSymbolsColor ?? DEFAULT_TOKEN_SYMBOLS_COLOR}
                              onSelect={(color) => updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, { tokenSymbolsColor: color }))}
                            />
                          </>)}
                          <ToggleSwitch
                            enabled={displaySettings?.filters?.filterTokenSymbols ?? false}
                            onChange={(v) => updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, { filterTokenSymbols: v }))}
                            disabled={selectedGroup.settings.useGlobalSettings}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1">
                          <p className="text-sm max-sm:text-base font-medium text-white flex items-center gap-1.5">
                            <i className="ri-file-code-line text-kol-text-muted" />
                            Mint Addresses
                          </p>
                          <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">Highlight tweets with contract addresses</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(displaySettings?.filters?.filterMintAddresses ?? false) && !selectedGroup.settings.useGlobalSettings && (<>
                            <Tooltip content="Desktop notification" position="top">
                              <button
                                onClick={() => {
                                  const notif = selectedGroup.settings.filters?.mintAddressesNotification ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION
                                  updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, {
                                    mintAddressesNotification: { ...notif, desktop: !notif.desktop },
                                  }))
                                }}
                                className={`
                                  w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                  ${(displaySettings?.filters?.mintAddressesNotification?.desktop ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.desktop)
                                    ? 'text-kol-blue bg-kol-blue/10'
                                    : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                  }
                                `}
                              >
                                <i className={(displaySettings?.filters?.mintAddressesNotification?.desktop ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.desktop) ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
                              </button>
                            </Tooltip>
                            <Tooltip content="Sound notification" position="top">
                              <button
                                onClick={() => {
                                  const notif = selectedGroup.settings.filters?.mintAddressesNotification ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION
                                  updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, {
                                    mintAddressesNotification: { ...notif, sound: !notif.sound },
                                  }))
                                }}
                                className={`
                                  w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                                  ${(displaySettings?.filters?.mintAddressesNotification?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound)
                                    ? 'text-kol-blue bg-kol-blue/10'
                                    : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                                  }
                                `}
                              >
                                <i className={(displaySettings?.filters?.mintAddressesNotification?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound) ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
                              </button>
                            </Tooltip>
                            <SoundPicker
                              currentSound={displaySettings?.filters?.mintAddressesNotification?.soundId ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.soundId}
                              onSelect={(soundId) => {
                                const notif = selectedGroup.settings.filters?.mintAddressesNotification ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION
                                updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, {
                                  mintAddressesNotification: { ...notif, soundId },
                                }))
                              }}
                              enabled={displaySettings?.filters?.mintAddressesNotification?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound}
                            />
                            <ColorPicker
                              currentColor={displaySettings?.filters?.mintAddressesColor ?? DEFAULT_MINT_ADDRESSES_COLOR}
                              onSelect={(color) => updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, { mintAddressesColor: color }))}
                            />
                          </>)}
                          <ToggleSwitch
                            enabled={displaySettings?.filters?.filterMintAddresses ?? false}
                            onChange={(v) => updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, { filterMintAddresses: v }))}
                            disabled={selectedGroup.settings.useGlobalSettings}
                          />
                        </div>
                      </div>
                      <KeywordInput
                        keywords={displaySettings?.filters?.keywords ?? []}
                        onChange={(v) => updateGroupFilters(selectedGroupId, buildFilters(selectedGroup.settings.filters, { keywords: v }))}
                        disabled={selectedGroup.settings.useGlobalSettings}
                      />
                    </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tweet Types Section */}
                  <div className="pt-2 border-t border-kol-border/20">
                    <div className="mb-2">
                      <button
                        onClick={() => toggleSection('group-tweets')}
                        className="w-full flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-[10px] max-sm:text-xs text-kol-text-muted uppercase tracking-wide font-medium flex items-center gap-1.5">
                          <i className="ri-chat-3-line" />
                          Tweet Types
                        </span>
                        <motion.i
                          animate={{ rotate: isSectionOpen('group-tweets') ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                          className="ri-arrow-down-s-line text-kol-text-muted text-sm"
                        />
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {isSectionOpen('group-tweets') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                    <div className="space-y-0.5">
                      {(Object.keys(TWEET_TYPE_LABELS) as TweetTypeKey[]).map(typeKey => (
                        <TweetTypeRow
                          key={typeKey}
                          typeKey={typeKey}
                          label={TWEET_TYPE_LABELS[typeKey]}
                          settings={(displaySettings?.tweetTypes ?? selectedGroup.settings.tweetTypes)[typeKey]}
                          groupDefaults={globalSettings.tweetTypes[typeKey]}
                          onChange={(updates) => updateGroupTweetType(selectedGroupId, typeKey, updates)}
                          accountDefaultPlatform={PLATFORM_OPTIONS.find(p => p.id === (displaySettings?.defaultLaunchPlatform ?? selectedGroup.settings.defaultLaunchPlatform))?.label}
                        />
                      ))}
                    </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
