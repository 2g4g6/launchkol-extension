import type { ContentFilters, PlatformType, FeedGroupSettings, AccountSettings, GlobalFeedSettings } from './types'

// Migrate old array-based filters to new boolean-based filters
export function migrateFilters(oldFilters: Record<string, unknown> | undefined): ContentFilters | undefined {
  if (!oldFilters) return undefined

  // If already in new format (has boolean fields)
  if (typeof oldFilters.filterTokenSymbols === 'boolean') {
    return oldFilters as unknown as ContentFilters
  }

  // Old format had arrays - convert to booleans based on whether arrays had values
  const oldTokenSymbols = oldFilters.tokenSymbols as string[] | undefined
  const oldMintAddresses = oldFilters.mintAddresses as string[] | undefined
  const oldKeywords = oldFilters.keywords as string[] | undefined

  return {
    filterTokenSymbols: Boolean(oldTokenSymbols && oldTokenSymbols.length > 0),
    filterMintAddresses: Boolean(oldMintAddresses && oldMintAddresses.length > 0),
    keywords: oldKeywords ?? [],
  }
}

// Migrate old group settings format to new format
export function migrateGroupSettings(oldSettings: Record<string, unknown>): FeedGroupSettings {
  // Check if already in new format (has tweetTypes as object with TweetTypeSettings)
  if (oldSettings.tweetTypes && typeof (oldSettings.tweetTypes as Record<string, unknown>).posts === 'object') {
    return oldSettings as unknown as FeedGroupSettings
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
    return oldSettings as AccountSettings
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
    return oldSettings as unknown as GlobalFeedSettings
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
