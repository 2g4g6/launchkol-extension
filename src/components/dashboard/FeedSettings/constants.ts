import type { PlatformType, TweetTypeKey, TweetTypeSettings, GlobalFeedSettings, FeedGroupSettings } from './types'

export const STORAGE_KEYS = {
  groups: 'launchkol_feed_groups',
  globalSettings: 'launchkol_global_feed_settings',
  recentColors: 'launchkol_recent_colors'
}

export const NOTIFICATION_SOUNDS = [
  { id: 'default', label: 'Default' },
  { id: 'buzz', label: 'Buzz' },
  { id: 'ching', label: 'Ching' },
  { id: 'ring', label: 'Ring' },
  { id: 'chime', label: 'Chime' },
  { id: 'alert', label: 'Alert' },
  { id: 'coin', label: 'Coin Drop' },
  { id: 'silent', label: 'Silent' },
]

export const TWEET_TYPE_LABELS: Record<TweetTypeKey, string> = {
  posts: 'Posts',
  replies: 'Replies',
  quotes: 'Quotes',
  reposts: 'Reposts',
  deletedTweets: 'Deleted',
  followingUpdates: 'Following',
}

export const TWEET_TYPE_ICONS: Record<TweetTypeKey, string> = {
  posts: 'ri-quill-pen-line',
  replies: 'ri-reply-line',
  quotes: 'ri-chat-quote-line',
  reposts: 'ri-repeat-2-line',
  deletedTweets: 'ri-delete-bin-line',
  followingUpdates: 'ri-user-add-line',
}

export const PLATFORM_OPTIONS: { id: PlatformType; label: string; icon: string }[] = [
  { id: 'pump', label: 'Pump.fun', icon: '/images/pump.svg' },
  { id: 'bonk', label: 'Bonk.fun', icon: '/images/bonk.svg' },
  { id: 'bags', label: 'Bags', icon: '/images/bags.svg' },
  { id: 'mayhem', label: 'Mayhem', icon: '/images/mayhem.svg' },
  { id: 'fourmeme', label: 'Four.meme', icon: '/images/fourmeme.svg' },
]

// Create default tweet type settings
export const createDefaultTweetTypeSettings = (): Record<TweetTypeKey, TweetTypeSettings> => ({
  posts: {
    enabled: true,
    notification: { desktop: true, sound: true, soundId: 'default' },
    highlightEnabled: false,
    highlightColor: '#007bff',
    launchPlatform: null,
  },
  replies: {
    enabled: true,
    notification: { desktop: true, sound: true, soundId: 'default' },
    highlightEnabled: false,
    highlightColor: '#00c46b',
    launchPlatform: null,
  },
  quotes: {
    enabled: true,
    notification: { desktop: true, sound: true, soundId: 'default' },
    highlightEnabled: false,
    highlightColor: '#8b5cf6',
    launchPlatform: null,
  },
  reposts: {
    enabled: true,
    notification: { desktop: true, sound: true, soundId: 'default' },
    highlightEnabled: false,
    highlightColor: '#06b6d4',
    launchPlatform: null,
  },
  deletedTweets: {
    enabled: false,
    notification: { desktop: true, sound: true, soundId: 'alert' },
    highlightEnabled: false,
    highlightColor: '#ff4d4f',
    launchPlatform: null,
  },
  followingUpdates: {
    enabled: false,
    notification: { desktop: true, sound: true, soundId: 'chime' },
    highlightEnabled: false,
    highlightColor: '#f59e0b',
    launchPlatform: null,
  },
})

export const DEFAULT_GLOBAL_SETTINGS: GlobalFeedSettings = {
  autoTranslate: false,
  translateFrom: 'auto',
  translateTo: 'en',
  pauseOnHover: false,
  notifications: true,
  soundVolume: 75,
  defaultLaunchPlatform: 'pump',
  tweetTypes: createDefaultTweetTypeSettings(),
}

export const DEFAULT_GROUP_SETTINGS: FeedGroupSettings = {
  useGlobalSettings: true,
  autoTranslate: false,
  translateFrom: 'auto',
  translateTo: 'en',
  pauseOnHover: false,
  notifications: true,
  soundVolume: 75,
  defaultLaunchPlatform: 'pump',
  tweetTypes: createDefaultTweetTypeSettings(),
}

export const GROUP_ICONS = [
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

export const LANGUAGES = [
  { code: 'auto', label: 'Any language' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'ar', label: 'Arabic' },
]

export const TARGET_LANGUAGES = LANGUAGES.filter(l => l.code !== 'auto')

export const HIGHLIGHT_COLORS = [
  { color: '#007bff', label: 'Blue' },
  { color: '#00c46b', label: 'Green' },
  { color: '#ff4d4f', label: 'Red' },
  { color: '#f59e0b', label: 'Orange' },
  { color: '#8b5cf6', label: 'Purple' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#06b6d4', label: 'Cyan' },
  { color: '#fbbf24', label: 'Yellow' },
]

export const DEFAULT_KEYWORD_COLOR = '#007bff'
