// Platform types for launch platforms
export type PlatformType = 'pump' | 'bonk' | 'bags' | 'mayhem' | 'fourmeme'

// Auto-buy trigger settings for keywords (account-level only)
export interface KeywordAutoBuy {
  enabled: boolean        // Whether auto-buy is active for this keyword
  tokenAddress: string    // Token mint address to buy
  buyAmount: string       // Amount in SOL to spend
}

// Keyword type for rich keyword management
export interface Keyword {
  id: string              // Unique ID for React keys and editing
  text: string            // The keyword text
  color: string           // Hex color from HIGHLIGHT_COLORS
  caseSensitive: boolean  // Match case exactly
  wholeWord: boolean      // Match whole words only
  enabled: boolean        // Toggle without deleting
  notification: TweetTypeNotificationSettings  // Desktop & sound notification settings
  autoBuy?: KeywordAutoBuy // Auto-buy trigger (account-level only)
}

// Per tweet type notification settings
export interface TweetTypeNotificationSettings {
  desktop: boolean     // Desktop notification enabled
  sound: boolean       // Sound notification enabled
  soundId: string      // 'default' | 'buzz' | 'ching' | 'ring' | 'chime' | 'alert' | 'coin' | 'silent'
}

// Filters for highlighting/notifications
export interface ContentFilters {
  filterTokenSymbols: boolean    // Highlight tweets containing token symbols ($XXX)
  tokenSymbolsColor: string      // Hex color for token symbol highlights
  tokenSymbolsNotification: TweetTypeNotificationSettings  // Desktop & sound for token symbols
  filterMintAddresses: boolean   // Highlight tweets containing mint addresses
  mintAddressesColor: string     // Hex color for mint address highlights
  mintAddressesNotification: TweetTypeNotificationSettings  // Desktop & sound for mint addresses
  keywords: Keyword[]            // Custom keywords to highlight with rich options
}

// Per tweet type settings
export interface TweetTypeSettings {
  enabled: boolean                           // Show this tweet type in feed
  notification: TweetTypeNotificationSettings
  highlightEnabled: boolean
  highlightColor: string                     // Hex color
  launchPlatform: string | null              // null = use account default
}

// Tweet type keys for type safety
export type TweetTypeKey = 'posts' | 'replies' | 'quotes' | 'reposts' | 'deletedTweets' | 'followingUpdates'

// Updated AccountSettings (all optional for inheritance)
export interface AccountSettings {
  // Translation (optional = inherit from group)
  autoTranslate?: boolean
  translateFrom?: string
  translateTo?: string

  // Default launch platform for this account
  defaultLaunchPlatform?: PlatformType

  // Sound volume for notifications (0-100)
  soundVolume?: number

  // Content filters for this account
  filters?: ContentFilters

  // Per-tweet-type settings (partial = inherit missing fields)
  tweetTypes?: Partial<Record<TweetTypeKey, Partial<TweetTypeSettings>>>
}

export interface Account {
  id: string
  handle: string
  name: string
  avatar?: string
  settings?: AccountSettings  // Optional - undefined = inherit all from group
}

export interface FeedGroupSettings {
  useGlobalSettings: boolean
  autoTranslate: boolean
  translateFrom: string
  translateTo: string
  pauseOnHover: boolean
  notifications: boolean
  soundVolume: number
  defaultLaunchPlatform: PlatformType
  filters?: ContentFilters
  tweetTypes: Record<TweetTypeKey, TweetTypeSettings>
}

export interface FeedGroup {
  id: string
  name: string
  icon: string
  accounts: Account[]
  settings: FeedGroupSettings
}

export interface GlobalFeedSettings {
  autoTranslate: boolean
  translateFrom: string
  translateTo: string
  pauseOnHover: boolean
  notifications: boolean
  soundVolume: number
  defaultLaunchPlatform: PlatformType
  filters?: ContentFilters
  tweetTypes: Record<TweetTypeKey, TweetTypeSettings>
}

export interface FeedSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}
