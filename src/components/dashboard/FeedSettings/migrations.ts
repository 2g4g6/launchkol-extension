import type { ContentFilters, PlatformType, FeedGroupSettings, AccountSettings, GlobalFeedSettings, Keyword } from './types'
import { DEFAULT_KEYWORD_COLOR, DEFAULT_TOKEN_SYMBOLS_COLOR, DEFAULT_MINT_ADDRESSES_COLOR, DEFAULT_FILTER_NOTIFICATION, DEFAULT_TOKEN_SYMBOLS_NOTIFICATION, DEFAULT_MINT_ADDRESSES_NOTIFICATION } from './constants'

// Generate a unique ID for keywords
function generateKeywordId(): string {
  return `kw_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Migrate old string[] keywords to new Keyword[] format
export function migrateKeywords(keywords: unknown): Keyword[] {
  if (!keywords || !Array.isArray(keywords)) {
    return []
  }

  return keywords.map((kw): Keyword => {
    // Already in new format (has text property)
    if (typeof kw === 'object' && kw !== null && 'text' in kw) {
      const existing = kw as Partial<Keyword> & { notification?: Partial<Keyword['notification']> }
      return {
        id: existing.id || generateKeywordId(),
        text: existing.text || '',
        color: existing.color || DEFAULT_KEYWORD_COLOR,
        caseSensitive: existing.caseSensitive ?? false,
        wholeWord: existing.wholeWord ?? false,
        enabled: existing.enabled ?? true,
        notification: {
          desktop: existing.notification?.desktop ?? DEFAULT_FILTER_NOTIFICATION.desktop,
          sound: existing.notification?.sound ?? DEFAULT_FILTER_NOTIFICATION.sound,
          soundId: existing.notification?.soundId ?? DEFAULT_FILTER_NOTIFICATION.soundId,
        },
      }
    }

    // Old format: plain string
    if (typeof kw === 'string') {
      return {
        id: generateKeywordId(),
        text: kw,
        color: DEFAULT_KEYWORD_COLOR,
        caseSensitive: false,
        wholeWord: false,
        enabled: true,
        notification: { ...DEFAULT_FILTER_NOTIFICATION },
      }
    }

    // Unknown format, skip
    return null as unknown as Keyword
  }).filter(Boolean)
}

// Migrate old array-based filters to new boolean-based filters
export function migrateFilters(oldFilters: Record<string, unknown> | undefined): ContentFilters | undefined {
  if (!oldFilters) return undefined

  // If already in new format (has boolean fields)
  if (typeof oldFilters.filterTokenSymbols === 'boolean') {
    // Still need to migrate keywords if they're in old string[] format
    const existingFilters = oldFilters as unknown as ContentFilters
    const existingTokenNotif = (oldFilters as Record<string, unknown>).tokenSymbolsNotification as Partial<ContentFilters['tokenSymbolsNotification']> | undefined
    const existingMintNotif = (oldFilters as Record<string, unknown>).mintAddressesNotification as Partial<ContentFilters['mintAddressesNotification']> | undefined
    return {
      ...existingFilters,
      // Ensure color fields exist (for migration from before colors were added)
      tokenSymbolsColor: existingFilters.tokenSymbolsColor || DEFAULT_TOKEN_SYMBOLS_COLOR,
      tokenSymbolsNotification: {
        desktop: existingTokenNotif?.desktop ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.desktop,
        sound: existingTokenNotif?.sound ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.sound,
        soundId: existingTokenNotif?.soundId ?? DEFAULT_TOKEN_SYMBOLS_NOTIFICATION.soundId,
      },
      mintAddressesColor: existingFilters.mintAddressesColor || DEFAULT_MINT_ADDRESSES_COLOR,
      mintAddressesNotification: {
        desktop: existingMintNotif?.desktop ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.desktop,
        sound: existingMintNotif?.sound ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.sound,
        soundId: existingMintNotif?.soundId ?? DEFAULT_MINT_ADDRESSES_NOTIFICATION.soundId,
      },
      keywords: migrateKeywords(existingFilters.keywords),
    }
  }

  // Old format had arrays - convert to booleans based on whether arrays had values
  const oldTokenSymbols = oldFilters.tokenSymbols as string[] | undefined
  const oldMintAddresses = oldFilters.mintAddresses as string[] | undefined
  const oldKeywords = oldFilters.keywords as unknown

  return {
    filterTokenSymbols: Boolean(oldTokenSymbols && oldTokenSymbols.length > 0),
    tokenSymbolsColor: DEFAULT_TOKEN_SYMBOLS_COLOR,
    tokenSymbolsNotification: { ...DEFAULT_TOKEN_SYMBOLS_NOTIFICATION },
    filterMintAddresses: Boolean(oldMintAddresses && oldMintAddresses.length > 0),
    mintAddressesColor: DEFAULT_MINT_ADDRESSES_COLOR,
    mintAddressesNotification: { ...DEFAULT_MINT_ADDRESSES_NOTIFICATION },
    keywords: migrateKeywords(oldKeywords),
  }
}

// Migrate old group settings format to new format
export function migrateGroupSettings(oldSettings: Record<string, unknown>): FeedGroupSettings {
  // Check if already in new format (has tweetTypes as object with TweetTypeSettings)
  if (oldSettings.tweetTypes && typeof (oldSettings.tweetTypes as Record<string, unknown>).posts === 'object') {
    // Still need to migrate filters (for keywords migration)
    const existingSettings = oldSettings as unknown as FeedGroupSettings
    return {
      ...existingSettings,
      filters: existingSettings.filters ? {
        ...existingSettings.filters,
        keywords: migrateKeywords(existingSettings.filters.keywords),
      } : undefined,
    }
  }

  // Old format had tweetTypes as Record<string, boolean>
  const oldTweetTypes = (oldSettings.tweetTypes || {}) as Record<string, boolean>

  return {
    useGlobalSettings: Boolean(oldSettings.useGlobalSettings),
    autoTranslate: Boolean(oldSettings.autoTranslate),
    translateFrom: String(oldSettings.translateFrom || 'auto'),
    translateTo: String(oldSettings.translateTo || 'en'),
    pauseOnHover: Boolean(oldSettings.pauseOnHover),
    notifications: Boolean(oldSettings.notifications ?? true),
    soundVolume: Number(oldSettings.soundVolume ?? 75),
    defaultLaunchPlatform: (oldSettings.defaultLaunchPlatform as PlatformType) || 'pump',
    filters: migrateFilters(oldSettings.filters as Record<string, unknown> | undefined),
    tweetTypes: {
      posts: {
        enabled: oldTweetTypes.posts ?? true,
        notification: { desktop: true, sound: true, soundId: 'default' },
        highlightEnabled: false,
        highlightColor: '#007bff',
        launchPlatform: null,
      },
      replies: {
        enabled: oldTweetTypes.replies ?? true,
        notification: { desktop: true, sound: true, soundId: 'default' },
        highlightEnabled: false,
        highlightColor: '#00c46b',
        launchPlatform: null,
      },
      quotes: {
        enabled: oldTweetTypes.quotes ?? true,
        notification: { desktop: true, sound: true, soundId: 'default' },
        highlightEnabled: false,
        highlightColor: '#8b5cf6',
        launchPlatform: null,
      },
      reposts: {
        enabled: oldTweetTypes.reposts ?? true,
        notification: { desktop: true, sound: true, soundId: 'default' },
        highlightEnabled: false,
        highlightColor: '#06b6d4',
        launchPlatform: null,
      },
      deletedTweets: {
        enabled: oldTweetTypes.deletedTweets ?? false,
        notification: { desktop: true, sound: true, soundId: 'alert' },
        highlightEnabled: false,
        highlightColor: '#ff4d4f',
        launchPlatform: null,
      },
      followingUpdates: {
        enabled: oldTweetTypes.followingUpdates ?? false,
        notification: { desktop: true, sound: true, soundId: 'chime' },
        highlightEnabled: false,
        highlightColor: '#f59e0b',
        launchPlatform: null,
      },
    },
  }
}

// Migrate old account settings format to new format
export function migrateAccountSettings(oldSettings: Record<string, unknown> | undefined): AccountSettings | undefined {
  if (!oldSettings) return undefined

  // Check if already in new format (no useGroupSettings field or has new tweetTypes structure)
  if (!('useGroupSettings' in oldSettings) && !('highlightTweets' in oldSettings)) {
    // Still need to migrate filters (for keywords migration)
    const existingSettings = oldSettings as AccountSettings
    if (existingSettings.filters) {
      return {
        ...existingSettings,
        filters: {
          ...existingSettings.filters,
          keywords: migrateKeywords(existingSettings.filters.keywords),
        },
      }
    }
    return existingSettings
  }

  // Migrate old format
  const newSettings: AccountSettings = {}

  // Migrate translation settings (only if not using group settings)
  if (oldSettings.useGroupSettings === false) {
    if (oldSettings.autoTranslate !== undefined) {
      newSettings.autoTranslate = Boolean(oldSettings.autoTranslate)
    }
    if (oldSettings.translateFrom) {
      newSettings.translateFrom = String(oldSettings.translateFrom)
    }
    if (oldSettings.translateTo) {
      newSettings.translateTo = String(oldSettings.translateTo)
    }
  }

  // Migrate old highlightTweets to per-type settings
  if (oldSettings.highlightTweets) {
    const color = String(oldSettings.highlightColor || '#007bff')
    newSettings.tweetTypes = {
      posts: { highlightEnabled: true, highlightColor: color },
      replies: { highlightEnabled: true, highlightColor: color },
      quotes: { highlightEnabled: true, highlightColor: color },
      reposts: { highlightEnabled: true, highlightColor: color },
      deletedTweets: { highlightEnabled: true, highlightColor: color },
      followingUpdates: { highlightEnabled: true, highlightColor: color },
    }
  }

  return Object.keys(newSettings).length > 0 ? newSettings : undefined
}

// Migrate global settings
export function migrateGlobalSettings(oldSettings: Record<string, unknown>): GlobalFeedSettings {
  // Check if already in new format
  if (oldSettings.tweetTypes && typeof (oldSettings.tweetTypes as Record<string, unknown>).posts === 'object') {
    // Still need to migrate filters (for keywords migration)
    const existingSettings = oldSettings as unknown as GlobalFeedSettings
    return {
      ...existingSettings,
      filters: existingSettings.filters ? {
        ...existingSettings.filters,
        keywords: migrateKeywords(existingSettings.filters.keywords),
      } : undefined,
    }
  }

  const oldTweetTypes = (oldSettings.tweetTypes || {}) as Record<string, boolean>

  return {
    autoTranslate: Boolean(oldSettings.autoTranslate),
    translateFrom: String(oldSettings.translateFrom || 'auto'),
    translateTo: String(oldSettings.translateTo || 'en'),
    pauseOnHover: Boolean(oldSettings.pauseOnHover),
    notifications: Boolean(oldSettings.notifications ?? true),
    soundVolume: Number(oldSettings.soundVolume ?? 75),
    defaultLaunchPlatform: (oldSettings.defaultLaunchPlatform as PlatformType) || 'pump',
    filters: migrateFilters(oldSettings.filters as Record<string, unknown> | undefined),
    tweetTypes: {
      posts: {
        enabled: oldTweetTypes.posts ?? true,
        notification: { desktop: true, sound: true, soundId: 'default' },
        highlightEnabled: false,
        highlightColor: '#007bff',
        launchPlatform: null,
      },
      replies: {
        enabled: oldTweetTypes.replies ?? true,
        notification: { desktop: true, sound: true, soundId: 'default' },
        highlightEnabled: false,
        highlightColor: '#00c46b',
        launchPlatform: null,
      },
      quotes: {
        enabled: oldTweetTypes.quotes ?? true,
        notification: { desktop: true, sound: true, soundId: 'default' },
        highlightEnabled: false,
        highlightColor: '#8b5cf6',
        launchPlatform: null,
      },
      reposts: {
        enabled: oldTweetTypes.reposts ?? true,
        notification: { desktop: true, sound: true, soundId: 'default' },
        highlightEnabled: false,
        highlightColor: '#06b6d4',
        launchPlatform: null,
      },
      deletedTweets: {
        enabled: oldTweetTypes.deletedTweets ?? false,
        notification: { desktop: true, sound: true, soundId: 'alert' },
        highlightEnabled: false,
        highlightColor: '#ff4d4f',
        launchPlatform: null,
      },
      followingUpdates: {
        enabled: oldTweetTypes.followingUpdates ?? false,
        notification: { desktop: true, sound: true, soundId: 'chime' },
        highlightEnabled: false,
        highlightColor: '#f59e0b',
        launchPlatform: null,
      },
    },
  }
}
