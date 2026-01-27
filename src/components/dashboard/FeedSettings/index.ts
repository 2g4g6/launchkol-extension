export { FeedSettingsModal, default } from './FeedSettingsModal'
export type { FeedSettingsModalProps } from './types'

// Re-export types for consumers that need them
export type {
  PlatformType,
  TweetTypeNotificationSettings,
  ContentFilters,
  TweetTypeSettings,
  TweetTypeKey,
  AccountSettings,
  Account,
  FeedGroupSettings,
  FeedGroup,
  GlobalFeedSettings,
} from './types'

// Re-export constants for consumers that need them
export {
  STORAGE_KEYS,
  NOTIFICATION_SOUNDS,
  TWEET_TYPE_LABELS,
  PLATFORM_OPTIONS,
  createDefaultTweetTypeSettings,
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_GROUP_SETTINGS,
  GROUP_ICONS,
  LANGUAGES,
  TARGET_LANGUAGES,
  HIGHLIGHT_COLORS,
} from './constants'
