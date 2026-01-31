import type { PlatformType, TweetTypeKey, TweetTypeSettings, GlobalFeedSettings, FeedGroupSettings } from './types'

export const STORAGE_KEYS = {
  groups: 'launchkol_feed_groups',
  globalSettings: 'launchkol_global_feed_settings',
  recentColors: 'launchkol_recent_colors'
}

export const NOTIFICATION_SOUNDS = [
  { id: 'default', label: 'Default', icon: 'ri-volume-up-line' },
  { id: 'buzz', label: 'Buzz', icon: 'ri-notification-badge-line' },
  { id: 'ching', label: 'Ching', icon: 'ri-money-dollar-circle-line' },
  { id: 'ring', label: 'Ring', icon: 'ri-notification-2-line' },
  { id: 'chime', label: 'Chime', icon: 'ri-door-open-line' },
  { id: 'alert', label: 'Alert', icon: 'ri-alarm-warning-line' },
  { id: 'coin', label: 'Coin Drop', icon: 'ri-coin-line' },
  { id: 'silent', label: 'Silent', icon: 'ri-volume-mute-line' },
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

// Icon picker types
export type IconCategory = 'popular' | 'finance' | 'social' | 'status' | 'organize' | 'nature' | 'misc'

export interface IconDefinition {
  icon: string
  label: string
  keywords: string[]
  category: IconCategory
}

export interface IconCategoryInfo {
  id: IconCategory
  label: string
  icon: string
}

// Category definitions
export const ICON_CATEGORIES: IconCategoryInfo[] = [
  { id: 'popular', label: 'Popular', icon: 'ri-fire-line' },
  { id: 'finance', label: 'Finance', icon: 'ri-line-chart-line' },
  { id: 'social', label: 'Social', icon: 'ri-twitter-x-line' },
  { id: 'status', label: 'Status', icon: 'ri-alarm-warning-line' },
  { id: 'organize', label: 'Organize', icon: 'ri-folder-line' },
  { id: 'nature', label: 'Nature', icon: 'ri-leaf-line' },
  { id: 'misc', label: 'Misc', icon: 'ri-apps-line' },
]

// ~80 icon definitions with labels and keywords
export const ICON_DEFINITIONS: IconDefinition[] = [
  // Popular (12)
  { icon: 'ri-fire-line', label: 'Fire', keywords: ['hot', 'trending', 'flame', 'burn'], category: 'popular' },
  { icon: 'ri-star-line', label: 'Star', keywords: ['favorite', 'rate', 'best', 'top'], category: 'popular' },
  { icon: 'ri-rocket-line', label: 'Rocket', keywords: ['launch', 'growth', 'moon', 'space'], category: 'popular' },
  { icon: 'ri-lightbulb-line', label: 'Lightbulb', keywords: ['idea', 'bright', 'insight', 'think'], category: 'popular' },
  { icon: 'ri-heart-line', label: 'Heart', keywords: ['love', 'like', 'favorite', 'care'], category: 'popular' },
  { icon: 'ri-bookmark-line', label: 'Bookmark', keywords: ['save', 'mark', 'later', 'read'], category: 'popular' },
  { icon: 'ri-vip-crown-line', label: 'Crown', keywords: ['vip', 'king', 'queen', 'premium', 'royal'], category: 'popular' },
  { icon: 'ri-flashlight-line', label: 'Flashlight', keywords: ['light', 'bright', 'spotlight', 'focus'], category: 'popular' },
  { icon: 'ri-trophy-line', label: 'Trophy', keywords: ['win', 'award', 'prize', 'champion'], category: 'popular' },
  { icon: 'ri-gift-line', label: 'Gift', keywords: ['present', 'reward', 'bonus', 'prize'], category: 'popular' },
  { icon: 'ri-magic-line', label: 'Magic', keywords: ['wand', 'spell', 'wizard', 'enchant'], category: 'popular' },

  // Finance (12)
  { icon: 'ri-line-chart-line', label: 'Line Chart', keywords: ['chart', 'graph', 'trend', 'analytics'], category: 'finance' },
  { icon: 'ri-bar-chart-line', label: 'Bar Chart', keywords: ['chart', 'graph', 'stats', 'data'], category: 'finance' },
  { icon: 'ri-pie-chart-line', label: 'Pie Chart', keywords: ['chart', 'graph', 'percentage', 'share'], category: 'finance' },
  { icon: 'ri-coin-line', label: 'Coin', keywords: ['money', 'currency', 'crypto', 'token'], category: 'finance' },
  { icon: 'ri-money-dollar-circle-line', label: 'Dollar', keywords: ['money', 'currency', 'usd', 'cash'], category: 'finance' },
  { icon: 'ri-wallet-line', label: 'Wallet', keywords: ['money', 'payment', 'funds', 'balance'], category: 'finance' },
  { icon: 'ri-exchange-line', label: 'Exchange', keywords: ['swap', 'trade', 'convert', 'transfer'], category: 'finance' },
  { icon: 'ri-bank-line', label: 'Bank', keywords: ['finance', 'money', 'deposit', 'institution'], category: 'finance' },
  { icon: 'ri-percent-line', label: 'Percent', keywords: ['percentage', 'rate', 'discount', 'fee'], category: 'finance' },
  { icon: 'ri-safe-line', label: 'Safe', keywords: ['secure', 'vault', 'protect', 'storage'], category: 'finance' },
  { icon: 'ri-stock-line', label: 'Stock', keywords: ['market', 'trade', 'invest', 'shares'], category: 'finance' },
  { icon: 'ri-funds-line', label: 'Funds', keywords: ['money', 'investment', 'capital', 'pool'], category: 'finance' },

  // Social (10)
  { icon: 'ri-twitter-x-line', label: 'Twitter/X', keywords: ['twitter', 'x', 'social', 'tweet'], category: 'social' },
  { icon: 'ri-user-star-line', label: 'User Star', keywords: ['influencer', 'kol', 'vip', 'important'], category: 'social' },
  { icon: 'ri-group-line', label: 'Group', keywords: ['team', 'people', 'users', 'community'], category: 'social' },
  { icon: 'ri-user-line', label: 'User', keywords: ['person', 'profile', 'account', 'member'], category: 'social' },
  { icon: 'ri-megaphone-line', label: 'Megaphone', keywords: ['announce', 'broadcast', 'shout', 'promote'], category: 'social' },
  { icon: 'ri-chat-1-line', label: 'Chat', keywords: ['message', 'talk', 'conversation', 'discuss'], category: 'social' },
  { icon: 'ri-discuss-line', label: 'Discuss', keywords: ['conversation', 'talk', 'forum', 'debate'], category: 'social' },
  { icon: 'ri-at-line', label: 'At', keywords: ['mention', 'tag', 'email', 'address'], category: 'social' },
  { icon: 'ri-share-line', label: 'Share', keywords: ['send', 'post', 'distribute', 'forward'], category: 'social' },
  { icon: 'ri-links-line', label: 'Links', keywords: ['connect', 'url', 'chain', 'network'], category: 'social' },

  // Status (10)
  { icon: 'ri-alarm-warning-line', label: 'Warning', keywords: ['alert', 'caution', 'danger', 'attention'], category: 'status' },
  { icon: 'ri-notification-line', label: 'Notification', keywords: ['alert', 'bell', 'notify', 'update'], category: 'status' },
  { icon: 'ri-timer-line', label: 'Timer', keywords: ['time', 'clock', 'countdown', 'wait'], category: 'status' },
  { icon: 'ri-check-line', label: 'Check', keywords: ['done', 'complete', 'success', 'yes'], category: 'status' },
  { icon: 'ri-close-line', label: 'Close', keywords: ['cancel', 'remove', 'delete', 'no'], category: 'status' },
  { icon: 'ri-shield-line', label: 'Shield', keywords: ['protect', 'security', 'safe', 'guard'], category: 'status' },
  { icon: 'ri-lock-line', label: 'Lock', keywords: ['secure', 'private', 'closed', 'protect'], category: 'status' },
  { icon: 'ri-eye-line', label: 'Eye', keywords: ['view', 'watch', 'visible', 'see'], category: 'status' },
  { icon: 'ri-eye-off-line', label: 'Eye Off', keywords: ['hide', 'invisible', 'private', 'hidden'], category: 'status' },
  { icon: 'ri-question-line', label: 'Question', keywords: ['help', 'info', 'unknown', 'ask'], category: 'status' },

  // Organize (12)
  { icon: 'ri-folder-line', label: 'Folder', keywords: ['directory', 'organize', 'files', 'category'], category: 'organize' },
  { icon: 'ri-archive-line', label: 'Archive', keywords: ['store', 'backup', 'old', 'save'], category: 'organize' },
  { icon: 'ri-inbox-line', label: 'Inbox', keywords: ['mail', 'receive', 'messages', 'new'], category: 'organize' },
  { icon: 'ri-list-check', label: 'List Check', keywords: ['todo', 'tasks', 'checklist', 'items'], category: 'organize' },
  { icon: 'ri-grid-line', label: 'Grid', keywords: ['layout', 'gallery', 'tiles', 'view'], category: 'organize' },
  { icon: 'ri-filter-line', label: 'Filter', keywords: ['sort', 'refine', 'narrow', 'select'], category: 'organize' },
  { icon: 'ri-price-tag-3-line', label: 'Tag', keywords: ['label', 'price', 'category', 'mark'], category: 'organize' },
  { icon: 'ri-flag-line', label: 'Flag', keywords: ['mark', 'important', 'report', 'country'], category: 'organize' },
  { icon: 'ri-pushpin-line', label: 'Pin', keywords: ['stick', 'attach', 'important', 'fixed'], category: 'organize' },
  { icon: 'ri-newspaper-line', label: 'Newspaper', keywords: ['news', 'article', 'read', 'media'], category: 'organize' },
  { icon: 'ri-file-list-line', label: 'File List', keywords: ['document', 'list', 'records', 'data'], category: 'organize' },
  { icon: 'ri-calendar-line', label: 'Calendar', keywords: ['date', 'schedule', 'event', 'time'], category: 'organize' },

  // Nature (12)
  { icon: 'ri-sun-line', label: 'Sun', keywords: ['day', 'light', 'bright', 'weather'], category: 'nature' },
  { icon: 'ri-moon-line', label: 'Moon', keywords: ['night', 'dark', 'lunar', 'sleep'], category: 'nature' },
  { icon: 'ri-leaf-line', label: 'Leaf', keywords: ['nature', 'plant', 'eco', 'green'], category: 'nature' },
  { icon: 'ri-plant-line', label: 'Plant', keywords: ['grow', 'nature', 'garden', 'seedling'], category: 'nature' },
  { icon: 'ri-drop-line', label: 'Drop', keywords: ['water', 'liquid', 'rain', 'tear'], category: 'nature' },
  { icon: 'ri-snowflake-line', label: 'Snowflake', keywords: ['cold', 'winter', 'freeze', 'ice'], category: 'nature' },
  { icon: 'ri-cloud-line', label: 'Cloud', keywords: ['weather', 'sky', 'storage', 'sync'], category: 'nature' },
  { icon: 'ri-earth-line', label: 'Earth', keywords: ['world', 'globe', 'planet', 'global'], category: 'nature' },
  { icon: 'ri-seedling-line', label: 'Seedling', keywords: ['grow', 'start', 'begin', 'new'], category: 'nature' },
  { icon: 'ri-rainbow-line', label: 'Rainbow', keywords: ['color', 'bright', 'hope', 'pride'], category: 'nature' },
  { icon: 'ri-windy-line', label: 'Wind', keywords: ['air', 'breeze', 'blow', 'weather'], category: 'nature' },
  { icon: 'ri-temp-hot-line', label: 'Hot', keywords: ['temperature', 'warm', 'heat', 'weather'], category: 'nature' },

  // Misc (12)
  { icon: 'ri-settings-3-line', label: 'Settings', keywords: ['config', 'options', 'gear', 'preferences'], category: 'misc' },
  { icon: 'ri-tools-line', label: 'Tools', keywords: ['build', 'repair', 'fix', 'utility'], category: 'misc' },
  { icon: 'ri-code-line', label: 'Code', keywords: ['develop', 'program', 'script', 'tech'], category: 'misc' },
  { icon: 'ri-terminal-line', label: 'Terminal', keywords: ['console', 'command', 'shell', 'cli'], category: 'misc' },
  { icon: 'ri-gamepad-line', label: 'Gamepad', keywords: ['game', 'play', 'controller', 'fun'], category: 'misc' },
  { icon: 'ri-apps-line', label: 'Apps', keywords: ['applications', 'grid', 'menu', 'programs'], category: 'misc' },
  { icon: 'ri-compass-3-line', label: 'Compass', keywords: ['navigate', 'direction', 'explore', 'guide'], category: 'misc' },
  { icon: 'ri-map-pin-line', label: 'Map Pin', keywords: ['location', 'place', 'marker', 'gps'], category: 'misc' },
  { icon: 'ri-search-line', label: 'Search', keywords: ['find', 'look', 'discover', 'query'], category: 'misc' },
  { icon: 'ri-zoom-in-line', label: 'Zoom In', keywords: ['magnify', 'enlarge', 'detail', 'closer'], category: 'misc' },
  { icon: 'ri-cursor-line', label: 'Cursor', keywords: ['pointer', 'click', 'select', 'mouse'], category: 'misc' },
  { icon: 'ri-fingerprint-line', label: 'Fingerprint', keywords: ['identity', 'biometric', 'secure', 'unique'], category: 'misc' },
]

// Backward compatibility - flat array of icon strings
export const GROUP_ICONS = ICON_DEFINITIONS.map(def => def.icon)

// Storage key for recently used icons
export const RECENT_ICONS_KEY = 'launchkol_recent_icons'

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
export const DEFAULT_TOKEN_SYMBOLS_COLOR = '#f59e0b'  // Orange
export const DEFAULT_MINT_ADDRESSES_COLOR = '#8b5cf6' // Purple

export const DEFAULT_FILTER_NOTIFICATION = { desktop: true, sound: true, soundId: 'default' }
export const DEFAULT_TOKEN_SYMBOLS_NOTIFICATION = { desktop: true, sound: true, soundId: 'coin' }
export const DEFAULT_MINT_ADDRESSES_NOTIFICATION = { desktop: true, sound: true, soundId: 'alert' }
