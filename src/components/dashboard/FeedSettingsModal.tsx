import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { BaseModal } from '../ui/BaseModal'
import { Tooltip } from '../ui/Tooltip'
import { PlatformLogoMap } from '../ui/PlatformLogos'

// ============================================================================
// Types
// ============================================================================

// Platform types for launch platforms
type PlatformType = 'pump' | 'bonk' | 'bags' | 'mayhem' | 'fourmeme'

// Per tweet type notification settings
interface TweetTypeNotificationSettings {
  desktop: boolean     // Desktop notification enabled
  sound: boolean       // Sound notification enabled
  soundId: string      // 'default' | 'buzz' | 'ching' | 'ring' | 'chime' | 'alert' | 'coin' | 'silent'
}

// Filters for highlighting/notifications
interface ContentFilters {
  filterTokenSymbols: boolean    // Highlight tweets containing token symbols ($XXX)
  filterMintAddresses: boolean   // Highlight tweets containing mint addresses
  keywords: string[]             // Custom keywords to highlight (empty array = disabled)
}

// Per tweet type settings
interface TweetTypeSettings {
  enabled: boolean                           // Show this tweet type in feed
  notification: TweetTypeNotificationSettings
  highlightEnabled: boolean
  highlightColor: string                     // Hex color
  launchPlatform: string | null              // null = use account default
}

// Tweet type keys for type safety
type TweetTypeKey = 'posts' | 'replies' | 'quotes' | 'reposts' | 'deletedTweets' | 'followingUpdates'

// Updated AccountSettings (all optional for inheritance)
interface AccountSettings {
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

interface Account {
  id: string
  handle: string
  name: string
  avatar?: string
  settings?: AccountSettings  // Optional - undefined = inherit all from group
}

interface FeedGroupSettings {
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

interface FeedGroup {
  id: string
  name: string
  icon: string
  accounts: Account[]
  settings: FeedGroupSettings
}

interface GlobalFeedSettings {
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

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  groups: 'launchkol_feed_groups',
  globalSettings: 'launchkol_global_feed_settings'
}

const NOTIFICATION_SOUNDS = [
  { id: 'default', label: 'Default' },
  { id: 'buzz', label: 'Buzz' },
  { id: 'ching', label: 'Ching' },
  { id: 'ring', label: 'Ring' },
  { id: 'chime', label: 'Chime' },
  { id: 'alert', label: 'Alert' },
  { id: 'coin', label: 'Coin Drop' },
  { id: 'silent', label: 'Silent' },
]

const TWEET_TYPE_LABELS: Record<TweetTypeKey, string> = {
  posts: 'Posts',
  replies: 'Replies',
  quotes: 'Quotes',
  reposts: 'Reposts',
  deletedTweets: 'Deleted',
  followingUpdates: 'Following',
}

const PLATFORM_OPTIONS: { id: PlatformType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pump', label: 'Pump.fun', Icon: PlatformLogoMap.pump },
  { id: 'bonk', label: 'Bonk.fun', Icon: PlatformLogoMap.bonk },
  { id: 'bags', label: 'Bags', Icon: PlatformLogoMap.bags },
  { id: 'mayhem', label: 'Mayhem', Icon: PlatformLogoMap.mayhem },
  { id: 'fourmeme', label: '4Meme', Icon: PlatformLogoMap.fourmeme },
]

// Create default tweet type settings
const createDefaultTweetTypeSettings = (): Record<TweetTypeKey, TweetTypeSettings> => ({
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

const DEFAULT_GLOBAL_SETTINGS: GlobalFeedSettings = {
  autoTranslate: false,
  translateFrom: 'auto',
  translateTo: 'en',
  pauseOnHover: false,
  notifications: true,
  soundVolume: 75,
  defaultLaunchPlatform: 'pump',
  tweetTypes: createDefaultTweetTypeSettings(),
}

const DEFAULT_GROUP_SETTINGS: FeedGroupSettings = {
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

const LANGUAGES = [
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

const TARGET_LANGUAGES = LANGUAGES.filter(l => l.code !== 'auto')

const HIGHLIGHT_COLORS = [
  { color: '#007bff', label: 'Blue' },
  { color: '#00c46b', label: 'Green' },
  { color: '#ff4d4f', label: 'Red' },
  { color: '#f59e0b', label: 'Orange' },
  { color: '#8b5cf6', label: 'Purple' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#06b6d4', label: 'Cyan' },
  { color: '#fbbf24', label: 'Yellow' },
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
        relative w-10 h-[22px] rounded-full transition-all duration-200
        ${enabled
          ? 'bg-kol-blue shadow-[0_0_8px_rgba(0,123,255,0.4)]'
          : 'bg-kol-border'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <motion.div
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? 21 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

interface LanguageSelectProps {
  value: string
  onChange: (value: string) => void
  options: { code: string; label: string }[]
  disabled?: boolean
}

function LanguageSelect({ value, onChange, options, disabled }: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.code === value) || options[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] py-1 max-h-[200px] overflow-y-auto scrollbar-styled"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
      >
        {options.map(option => (
          <button
            key={option.code}
            onClick={(e) => {
              e.stopPropagation()
              onChange(option.code)
              setIsOpen(false)
            }}
            className={`
              w-full px-3 py-2 text-left text-xs transition-colors
              ${option.code === value
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) setIsOpen(!isOpen)
        }}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full h-8 px-3 rounded-lg bg-kol-surface/50 border text-xs transition-colors
          ${isOpen ? 'border-kol-blue/50' : 'border-kol-border/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-kol-border'}
        `}
      >
        <span className="text-white">{selectedOption.label}</span>
        <i className={`ri-arrow-down-s-line text-kol-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}

interface IconPickerProps {
  currentIcon: string
  onSelect: (icon: string) => void
}

function IconPicker({ currentIcon, onSelect }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate dropdown position when opening (centered below icon)
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const dropdownWidth = 5 * 28 + 2 * 8 + 4 * 4 // 5 cols * 28px + padding + gaps
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left + rect.width / 2 - dropdownWidth / 2,
    })
  }, [])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed p-2 bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] grid grid-cols-5 gap-1"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        {GROUP_ICONS.map(icon => (
          <button
            key={icon}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(icon)
              setIsOpen(false)
            }}
            className={`
              w-7 h-7 rounded flex items-center justify-center transition-colors
              ${icon === currentIcon
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'hover:bg-kol-surface-elevated text-kol-text-muted hover:text-white'
              }
            `}
          >
            <i className={`${icon} text-sm`} />
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-6 h-6 rounded flex items-center justify-center hover:bg-kol-surface-elevated transition-colors flex-shrink-0"
      >
        <i className={`${currentIcon} text-sm text-kol-text-muted`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}

interface ColorPickerProps {
  currentColor: string
  onSelect: (color: string) => void
}

function ColorPicker({ currentColor, onSelect }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate dropdown position when opening (centered below swatch)
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const dropdownWidth = 4 * 28 + 2 * 8 + 3 * 4 // 4 cols * 28px + padding + gaps
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left + rect.width / 2 - dropdownWidth / 2,
    })
  }, [])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed p-2 bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] grid grid-cols-4 gap-1"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        {HIGHLIGHT_COLORS.map(({ color, label }) => (
          <Tooltip key={color} content={label} position="top">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelect(color)
                setIsOpen(false)
              }}
              className={`
                w-7 h-7 rounded-md flex items-center justify-center transition-all
                ${color === currentColor
                  ? 'ring-2 ring-white ring-offset-1 ring-offset-kol-bg'
                  : 'hover:scale-110'
                }
              `}
              style={{ backgroundColor: color }}
            />
          </Tooltip>
        ))}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 ring-1 ring-kol-border/50"
        style={{ backgroundColor: currentColor }}
      />
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}

// Inherited indicator dot
function InheritedIndicator({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <Tooltip content="Inherited from group" position="top">
      <span className="w-1.5 h-1.5 rounded-full bg-kol-text-muted/50 flex-shrink-0" />
    </Tooltip>
  )
}

// Sound Picker dropdown
interface SoundPickerProps {
  currentSound: string
  onSelect: (soundId: string) => void
  enabled: boolean
}

function SoundPicker({ currentSound, onSelect, enabled }: SoundPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] py-1 min-w-[120px]"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        {NOTIFICATION_SOUNDS.map(sound => (
          <button
            key={sound.id}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(sound.id)
              setIsOpen(false)
            }}
            className={`
              w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center gap-2
              ${sound.id === currentSound
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
              }
            `}
          >
            <i className={sound.id === 'silent' ? 'ri-volume-mute-line' : 'ri-volume-up-line'} />
            {sound.label}
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation()
          if (enabled) setIsOpen(!isOpen)
        }}
        disabled={!enabled}
        className={`
          flex items-center gap-1 h-6 px-1.5 rounded text-xs transition-colors
          ${enabled
            ? 'text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated'
            : 'text-kol-text-muted/40 cursor-not-allowed'
          }
        `}
      >
        <i className={currentSound === 'silent' ? 'ri-volume-mute-line' : 'ri-volume-up-line'} />
        <i className={`ri-arrow-down-s-line text-[10px] ${isOpen ? 'rotate-180' : ''} transition-transform`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}

// Platform Picker dropdown
interface PlatformPickerProps {
  currentPlatform: string | null
  onSelect: (platform: string | null) => void
  accountDefault?: string
}

function PlatformPicker({ currentPlatform, onSelect, accountDefault }: PlatformPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedPlatform = currentPlatform
    ? PLATFORM_OPTIONS.find(p => p.id === currentPlatform)
    : null

  const displayLabel = selectedPlatform?.label || 'Default'

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] py-1 min-w-[100px]"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        {/* Default option */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect(null)
            setIsOpen(false)
          }}
          className={`
            w-full px-3 py-1.5 text-left text-xs transition-colors
            ${currentPlatform === null
              ? 'bg-kol-blue/15 text-kol-blue'
              : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
            }
          `}
        >
          Default {accountDefault && <span className="text-kol-text-muted/60">({accountDefault})</span>}
        </button>
        {PLATFORM_OPTIONS.map(platform => (
          <button
            key={platform.id}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(platform.id)
              setIsOpen(false)
            }}
            className={`
              w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center gap-2
              ${platform.id === currentPlatform
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
              }
            `}
          >
            <platform.Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{platform.label}</span>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-1.5 h-6 px-1.5 rounded text-xs text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated transition-colors"
      >
        {selectedPlatform && <selectedPlatform.Icon className="w-3.5 h-3.5 flex-shrink-0" />}
        <span className="max-w-[60px] truncate">{displayLabel}</span>
        <i className={`ri-arrow-down-s-line text-[10px] ${isOpen ? 'rotate-180' : ''} transition-transform`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}

// Volume Slider
interface VolumeSliderProps {
  value: number
  onChange: (volume: number) => void
}

function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  return (
    <div className="flex items-center gap-3 flex-1">
      <i className={`ri-volume-${value === 0 ? 'mute' : value < 50 ? 'down' : 'up'}-line text-kol-text-muted`} />
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-1.5 bg-kol-surface-elevated rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-kol-blue [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,123,255,0.4)]
          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-kol-blue [&::-moz-range-thumb]:border-0"
        style={{
          background: `linear-gradient(to right, #007bff ${value}%, #1a1a1a ${value}%)`
        }}
      />
      <span className="text-xs text-kol-text-muted w-8 text-right">{value}%</span>
    </div>
  )
}

// Tweet Type Row - compact inline controls for each tweet type
interface TweetTypeRowProps {
  typeKey: TweetTypeKey
  label: string
  settings: Partial<TweetTypeSettings> | undefined
  groupDefaults: TweetTypeSettings
  onChange: (updates: Partial<TweetTypeSettings>) => void
  accountDefaultPlatform?: string
}

function TweetTypeRow({ label, settings, groupDefaults, onChange, accountDefaultPlatform }: TweetTypeRowProps) {
  // Merge with defaults to get effective values
  const effective: TweetTypeSettings = {
    enabled: settings?.enabled ?? groupDefaults.enabled,
    notification: {
      desktop: settings?.notification?.desktop ?? groupDefaults.notification.desktop,
      sound: settings?.notification?.sound ?? groupDefaults.notification.sound,
      soundId: settings?.notification?.soundId ?? groupDefaults.notification.soundId,
    },
    highlightEnabled: settings?.highlightEnabled ?? groupDefaults.highlightEnabled,
    highlightColor: settings?.highlightColor ?? groupDefaults.highlightColor,
    launchPlatform: settings?.launchPlatform ?? groupDefaults.launchPlatform,
  }

  // Check if values are inherited (undefined in settings)
  const isEnabledInherited = settings?.enabled === undefined
  const isDesktopInherited = settings?.notification?.desktop === undefined
  const isSoundInherited = settings?.notification?.sound === undefined
  const isColorInherited = settings?.highlightColor === undefined
  const isPlatformInherited = settings?.launchPlatform === undefined

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-kol-surface/30 transition-colors">
      {/* Enable pill */}
      <button
        onClick={() => onChange({ enabled: !effective.enabled })}
        className={`
          h-5 px-2 rounded text-[10px] font-medium transition-colors border min-w-[60px]
          ${effective.enabled
            ? 'bg-kol-blue/15 text-kol-blue border-kol-blue/50'
            : 'bg-kol-surface/45 border-kol-border text-kol-text-muted hover:bg-kol-surface-elevated'
          }
        `}
      >
        {label}
      </button>

      {/* Inherited indicator */}
      <InheritedIndicator show={isEnabledInherited} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Desktop notification toggle */}
      <Tooltip content="Desktop notification" position="top">
        <button
          onClick={() => onChange({
            notification: { ...effective.notification, desktop: !effective.notification.desktop }
          })}
          className={`
            w-6 h-6 rounded flex items-center justify-center transition-colors
            ${effective.notification.desktop
              ? 'text-kol-blue bg-kol-blue/10'
              : 'text-kol-text-muted/40 hover:text-kol-text-muted'
            }
          `}
        >
          <i className={effective.notification.desktop ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
        </button>
      </Tooltip>
      <InheritedIndicator show={isDesktopInherited} />

      {/* Sound picker */}
      <Tooltip content="Sound notification" position="top">
        <button
          onClick={() => onChange({
            notification: { ...effective.notification, sound: !effective.notification.sound }
          })}
          className={`
            w-6 h-6 rounded flex items-center justify-center transition-colors
            ${effective.notification.sound
              ? 'text-kol-blue bg-kol-blue/10'
              : 'text-kol-text-muted/40 hover:text-kol-text-muted'
            }
          `}
        >
          <i className={effective.notification.sound ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
        </button>
      </Tooltip>
      <SoundPicker
        currentSound={effective.notification.soundId}
        onSelect={(soundId) => onChange({
          notification: { ...effective.notification, soundId }
        })}
        enabled={effective.notification.sound}
      />
      <InheritedIndicator show={isSoundInherited} />

      {/* Color swatch */}
      <Tooltip content="Highlight color" position="top">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ highlightEnabled: !effective.highlightEnabled })}
            className={`
              w-5 h-5 rounded-md transition-all ring-1
              ${effective.highlightEnabled
                ? 'ring-white/50 scale-100'
                : 'ring-kol-border/30 opacity-40 scale-90'
              }
            `}
            style={{ backgroundColor: effective.highlightColor }}
          />
        </div>
      </Tooltip>
      <ColorPicker
        currentColor={effective.highlightColor}
        onSelect={(color) => onChange({ highlightColor: color, highlightEnabled: true })}
      />
      <InheritedIndicator show={isColorInherited} />

      {/* Platform override */}
      <PlatformPicker
        currentPlatform={effective.launchPlatform}
        onSelect={(platform) => onChange({ launchPlatform: platform })}
        accountDefault={accountDefaultPlatform}
      />
      <InheritedIndicator show={isPlatformInherited} />
    </div>
  )
}

// ============================================================================
// Migration Helpers
// ============================================================================

// Migrate old array-based filters to new boolean-based filters
function migrateFilters(oldFilters: Record<string, unknown> | undefined): ContentFilters | undefined {
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
function migrateGroupSettings(oldSettings: Record<string, unknown>): FeedGroupSettings {
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
function migrateAccountSettings(oldSettings: Record<string, unknown> | undefined): AccountSettings | undefined {
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
function migrateGlobalSettings(oldSettings: Record<string, unknown>): GlobalFeedSettings {
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

// Platform select with icons
interface PlatformSelectProps {
  value: PlatformType
  onChange: (value: PlatformType) => void
  disabled?: boolean
  showDefault?: boolean
  defaultLabel?: string
}

function PlatformSelect({ value, onChange, disabled, showDefault, defaultLabel }: PlatformSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = PLATFORM_OPTIONS.find(p => p.id === value) || PLATFORM_OPTIONS[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 140),
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] py-1"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left, minWidth: dropdownPosition.width }}
      >
        {showDefault && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left text-xs text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white transition-colors"
          >
            Default {defaultLabel && <span className="text-kol-text-muted/60">({defaultLabel})</span>}
          </button>
        )}
        {PLATFORM_OPTIONS.map(platform => (
          <button
            key={platform.id}
            onClick={(e) => {
              e.stopPropagation()
              onChange(platform.id)
              setIsOpen(false)
            }}
            className={`
              w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-2
              ${platform.id === value
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated hover:text-white'
              }
            `}
          >
            <platform.Icon className="w-4 h-4 flex-shrink-0" />
            <span>{platform.label}</span>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) setIsOpen(!isOpen)
        }}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-2 h-8 px-3 rounded-lg bg-kol-surface/50 border text-xs transition-colors
          ${isOpen ? 'border-kol-blue/50' : 'border-kol-border/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-kol-border'}
        `}
      >
        <div className="flex items-center gap-2">
          <selectedOption.Icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-white">{selectedOption.label}</span>
        </div>
        <i className={`ri-arrow-down-s-line text-kol-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}

// Keyword input component for custom keywords
interface KeywordInputProps {
  keywords: string[]
  onChange: (keywords: string[]) => void
  disabled?: boolean
}

function KeywordInput({ keywords, onChange, disabled }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addKeyword()
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      // Remove last keyword when backspace on empty input
      onChange(keywords.slice(0, -1))
    }
  }

  const addKeyword = () => {
    const trimmed = inputValue.trim().toLowerCase()
    if (trimmed && !keywords.includes(trimmed)) {
      onChange([...keywords, trimmed])
    }
    setInputValue('')
  }

  const removeKeyword = (keyword: string) => {
    onChange(keywords.filter(k => k !== keyword))
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`
        min-h-[32px] px-2 py-1 rounded-lg bg-kol-surface/50 border border-kol-border/50
        flex flex-wrap items-center gap-1.5 cursor-text transition-colors
        focus-within:border-kol-blue/50
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {keywords.map(keyword => (
        <span
          key={keyword}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-kol-blue/20 text-kol-blue rounded text-xs"
        >
          {keyword}
          {!disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeKeyword(keyword)
              }}
              className="hover:text-white transition-colors"
            >
              <i className="ri-close-line text-[10px]" />
            </button>
          )}
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addKeyword}
        placeholder={keywords.length === 0 ? "Type keywords, press Enter..." : ""}
        disabled={disabled}
        className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-xs text-white placeholder:text-kol-text-muted/50"
      />
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
  const [isAccountSearchFocused, setIsAccountSearchFocused] = useState(false)
  const [isNewAccountFocused, setIsNewAccountFocused] = useState(false)
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null)

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
    >
      <div className="flex h-[460px] -mx-4 -mt-4 -mb-4">
        {/* Left Column - Groups Sidebar */}
        <div className="w-[200px] flex flex-col border-r border-kol-border/50 bg-kol-surface/30">
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
            <i className="ri-global-line text-sm" />
            <span className="text-xs font-medium">All Feeds</span>
          </button>

          {/* Divider */}
          <div className="h-px bg-kol-border/50 mx-3 my-2" />

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto scrollbar-styled">
            {groups.map(group => (
              <div
                key={group.id}
                className="group relative"
              >
                <div
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 transition-all group-hover:pr-12
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
                    <button
                      onClick={() => {
                        setSelectedGroupId(group.id)
                        setSelectedTab('accounts')
                      }}
                      className="flex-1 text-left text-xs font-medium truncate min-w-0"
                    >
                      {group.name}
                    </button>
                  )}

                  <span className="text-[10px] text-kol-text-muted group-hover:opacity-0 transition-opacity">{group.accounts.length}</span>
                </div>

                {/* Edit/Delete on hover */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
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
                </div>
              </div>
            ))}
          </div>

          {/* New Group Button */}
          <Tooltip content="Create new feed group" position="right">
            <button
              onClick={createGroup}
              className="flex items-center justify-center gap-2.5 px-3 py-2.5 text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated/50 transition-colors border-t border-kol-border/30 w-full"
            >
              <i className="ri-add-line text-sm" />
              <span className="text-xs font-medium">New Group</span>
            </button>
          </Tooltip>
        </div>

        {/* Right Column - Tab Content */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
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
              <div className="flex-1 overflow-y-auto scrollbar-styled space-y-5">
                <div className="p-3 rounded-lg bg-kol-surface/30 border border-kol-border/30">
                  <p className="text-xs text-kol-text-muted">
                    <i className="ri-information-line mr-1.5" />
                    These settings apply to all groups that have "Use global settings" enabled.
                  </p>
                </div>

                {/* General Settings Section */}
                <div>
                  <span className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium">
                    General Settings
                  </span>
                </div>

                {/* Toggle Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Auto-translate tweets</p>
                      <p className="text-xs text-kol-text-muted mt-0.5">Translate tweets to your preferred language</p>
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
                      <p className="text-sm font-medium text-white">Pause feed on hover</p>
                      <p className="text-xs text-kol-text-muted mt-0.5">Stop auto-scrolling when hovering</p>
                    </div>
                    <ToggleSwitch
                      enabled={globalSettings.pauseOnHover}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, pauseOnHover: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Default Launch Platform</p>
                      <p className="text-xs text-kol-text-muted mt-0.5">Platform to open coins on</p>
                    </div>
                    <PlatformSelect
                      value={globalSettings.defaultLaunchPlatform}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, defaultLaunchPlatform: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1">
                    <div>
                      <p className="text-sm font-medium text-white">Sound Volume</p>
                      <p className="text-xs text-kol-text-muted mt-0.5">Volume for notification sounds</p>
                    </div>
                    <VolumeSlider
                      value={globalSettings.soundVolume}
                      onChange={(v) => setGlobalSettings({ ...globalSettings, soundVolume: v })}
                    />
                  </div>
                </div>

                {/* Filters Section */}
                <div className="pt-2 border-t border-kol-border/20">
                  <div className="mb-3">
                    <span className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium">
                      Highlight Filters
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Token Symbols</p>
                        <p className="text-xs text-kol-text-muted mt-0.5">Highlight tweets with $TOKEN mentions</p>
                      </div>
                      <ToggleSwitch
                        enabled={globalSettings.filters?.filterTokenSymbols ?? false}
                        onChange={(v) => setGlobalSettings({
                          ...globalSettings,
                          filters: {
                            ...globalSettings.filters,
                            filterTokenSymbols: v,
                            filterMintAddresses: globalSettings.filters?.filterMintAddresses ?? false,
                            keywords: globalSettings.filters?.keywords ?? [],
                          }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Mint Addresses</p>
                        <p className="text-xs text-kol-text-muted mt-0.5">Highlight tweets with contract addresses</p>
                      </div>
                      <ToggleSwitch
                        enabled={globalSettings.filters?.filterMintAddresses ?? false}
                        onChange={(v) => setGlobalSettings({
                          ...globalSettings,
                          filters: {
                            ...globalSettings.filters,
                            filterTokenSymbols: globalSettings.filters?.filterTokenSymbols ?? false,
                            filterMintAddresses: v,
                            keywords: globalSettings.filters?.keywords ?? [],
                          }
                        })}
                      />
                    </div>
                    <div className="py-1">
                      <div className="mb-2">
                        <p className="text-sm font-medium text-white">Keywords</p>
                        <p className="text-xs text-kol-text-muted mt-0.5">Highlight tweets containing these keywords</p>
                      </div>
                      <KeywordInput
                        keywords={globalSettings.filters?.keywords ?? []}
                        onChange={(v) => setGlobalSettings({
                          ...globalSettings,
                          filters: {
                            ...globalSettings.filters,
                            filterTokenSymbols: globalSettings.filters?.filterTokenSymbols ?? false,
                            filterMintAddresses: globalSettings.filters?.filterMintAddresses ?? false,
                            keywords: v,
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Tweet Types Section */}
                <div className="pt-2 border-t border-kol-border/20">
                  <div className="mb-2">
                    <span className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium">
                      Tweet Types
                    </span>
                  </div>
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
                    className={`w-full h-9 pl-8 pr-3 rounded-lg bg-kol-surface/50 border text-sm text-white placeholder:text-kol-text-muted/50 focus:outline-none transition-all duration-300 ${
                      isAccountSearchFocused ? 'border-kol-blue/50' : 'border-kol-border/50'
                    }`}
                  />
                </div>

                {/* Accounts List - Scrollable middle section */}
                <div className="flex-1 overflow-y-auto scrollbar-styled min-h-0">
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
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10 transition-all"
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
                                        <span className="text-[9px] text-kol-text-muted uppercase tracking-wide font-medium">
                                          General Settings
                                        </span>
                                      </div>

                                      <div className="space-y-3">
                                        {/* Auto-translate */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-medium text-white">Auto-translate</p>
                                            <InheritedIndicator show={account.settings?.autoTranslate === undefined} />
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
                                            <p className="text-xs font-medium text-white">Default Launch Platform</p>
                                            <InheritedIndicator show={account.settings?.defaultLaunchPlatform === undefined} />
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
                                            <p className="text-xs font-medium text-white">Sound Volume</p>
                                            <InheritedIndicator show={account.settings?.soundVolume === undefined} />
                                          </div>
                                          <VolumeSlider
                                            value={account.settings?.soundVolume ?? groupSettings.soundVolume}
                                            onChange={(v) => updateAccountSettings(selectedGroupId, account.id, { soundVolume: v })}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Filters Section */}
                                    <div>
                                      <div className="mb-2">
                                        <span className="text-[9px] text-kol-text-muted uppercase tracking-wide font-medium">
                                          Highlight Filters
                                        </span>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-medium text-white">Token Symbols</p>
                                            <InheritedIndicator show={account.settings?.filters?.filterTokenSymbols === undefined} />
                                          </div>
                                          <ToggleSwitch
                                            enabled={account.settings?.filters?.filterTokenSymbols ?? groupSettings.filters?.filterTokenSymbols ?? false}
                                            onChange={(v) => updateAccountFilters(selectedGroupId, account.id, {
                                              ...account.settings?.filters,
                                              filterTokenSymbols: v,
                                              filterMintAddresses: account.settings?.filters?.filterMintAddresses ?? false,
                                              keywords: account.settings?.filters?.keywords ?? [],
                                            })}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-medium text-white">Mint Addresses</p>
                                            <InheritedIndicator show={account.settings?.filters?.filterMintAddresses === undefined} />
                                          </div>
                                          <ToggleSwitch
                                            enabled={account.settings?.filters?.filterMintAddresses ?? groupSettings.filters?.filterMintAddresses ?? false}
                                            onChange={(v) => updateAccountFilters(selectedGroupId, account.id, {
                                              ...account.settings?.filters,
                                              filterTokenSymbols: account.settings?.filters?.filterTokenSymbols ?? false,
                                              filterMintAddresses: v,
                                              keywords: account.settings?.filters?.keywords ?? [],
                                            })}
                                          />
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                            <p className="text-xs font-medium text-white">Keywords</p>
                                            <InheritedIndicator show={account.settings?.filters?.keywords === undefined} />
                                          </div>
                                          <KeywordInput
                                            keywords={account.settings?.filters?.keywords ?? groupSettings.filters?.keywords ?? []}
                                            onChange={(v) => updateAccountFilters(selectedGroupId, account.id, {
                                              ...account.settings?.filters,
                                              filterTokenSymbols: account.settings?.filters?.filterTokenSymbols ?? false,
                                              filterMintAddresses: account.settings?.filters?.filterMintAddresses ?? false,
                                              keywords: v,
                                            })}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tweet Types Section */}
                                    <div>
                                      <div className="mb-2">
                                        <span className="text-[9px] text-kol-text-muted uppercase tracking-wide font-medium">
                                          Tweet Types
                                        </span>
                                      </div>

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
                      className={`flex-1 h-9 px-3 rounded-lg bg-kol-surface/50 border text-sm text-white placeholder:text-kol-text-muted/50 focus:outline-none transition-all duration-300 ${
                        isNewAccountFocused ? 'border-kol-blue/50' : 'border-kol-border/50'
                      }`}
                    />
                    <button
                      onClick={() => addAccount(selectedGroupId)}
                      disabled={!newAccountHandle.trim()}
                      className={`
                        px-4 h-9 rounded-lg text-xs font-medium transition-all
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
              <div className="flex-1 overflow-y-auto scrollbar-styled space-y-5">
                {/* Use Global Settings Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-kol-surface/30 border border-kol-border/30">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Use global settings</p>
                    <p className="text-xs text-kol-text-muted mt-0.5">Override with group-specific settings when disabled</p>
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
                      <span className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium">
                        General Settings
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Auto-translate tweets</p>
                          <p className="text-xs text-kol-text-muted mt-0.5">Translate tweets to your preferred language</p>
                        </div>
                        <ToggleSwitch
                          enabled={selectedGroup.settings.autoTranslate}
                          onChange={(v) => updateGroupSettings(selectedGroupId, { autoTranslate: v })}
                          disabled={selectedGroup.settings.useGlobalSettings}
                        />
                      </div>

                      {/* Language Selection - shown when auto-translate is enabled */}
                      <AnimatePresence>
                        {selectedGroup.settings.autoTranslate && !selectedGroup.settings.useGlobalSettings && (
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
                                  value={selectedGroup.settings.translateFrom}
                                  onChange={(v) => updateGroupSettings(selectedGroupId, { translateFrom: v })}
                                  options={LANGUAGES}
                                  disabled={selectedGroup.settings.useGlobalSettings}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium mb-1.5 block">To</label>
                                <LanguageSelect
                                  value={selectedGroup.settings.translateTo}
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
                          <p className="text-sm font-medium text-white">Pause feed on hover</p>
                          <p className="text-xs text-kol-text-muted mt-0.5">Stop auto-scrolling when hovering</p>
                        </div>
                        <ToggleSwitch
                          enabled={selectedGroup.settings.pauseOnHover}
                          onChange={(v) => updateGroupSettings(selectedGroupId, { pauseOnHover: v })}
                          disabled={selectedGroup.settings.useGlobalSettings}
                        />
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Default Launch Platform</p>
                          <p className="text-xs text-kol-text-muted mt-0.5">Platform to open coins on</p>
                        </div>
                        <PlatformSelect
                          value={selectedGroup.settings.defaultLaunchPlatform}
                          onChange={(v) => updateGroupSettings(selectedGroupId, { defaultLaunchPlatform: v })}
                          disabled={selectedGroup.settings.useGlobalSettings}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 py-1">
                        <div>
                          <p className="text-sm font-medium text-white">Sound Volume</p>
                          <p className="text-xs text-kol-text-muted mt-0.5">Volume for notification sounds</p>
                        </div>
                        <VolumeSlider
                          value={selectedGroup.settings.soundVolume}
                          onChange={(v) => updateGroupSettings(selectedGroupId, { soundVolume: v })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filters Section */}
                  <div className="mb-4 pt-2 border-t border-kol-border/20">
                    <div className="mb-3">
                      <span className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium">
                        Highlight Filters
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Token Symbols</p>
                          <p className="text-xs text-kol-text-muted mt-0.5">Highlight tweets with $TOKEN mentions</p>
                        </div>
                        <ToggleSwitch
                          enabled={selectedGroup.settings.filters?.filterTokenSymbols ?? false}
                          onChange={(v) => updateGroupFilters(selectedGroupId, {
                            ...selectedGroup.settings.filters,
                            filterTokenSymbols: v,
                            filterMintAddresses: selectedGroup.settings.filters?.filterMintAddresses ?? false,
                            keywords: selectedGroup.settings.filters?.keywords ?? [],
                          })}
                          disabled={selectedGroup.settings.useGlobalSettings}
                        />
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Mint Addresses</p>
                          <p className="text-xs text-kol-text-muted mt-0.5">Highlight tweets with contract addresses</p>
                        </div>
                        <ToggleSwitch
                          enabled={selectedGroup.settings.filters?.filterMintAddresses ?? false}
                          onChange={(v) => updateGroupFilters(selectedGroupId, {
                            ...selectedGroup.settings.filters,
                            filterTokenSymbols: selectedGroup.settings.filters?.filterTokenSymbols ?? false,
                            filterMintAddresses: v,
                            keywords: selectedGroup.settings.filters?.keywords ?? [],
                          })}
                          disabled={selectedGroup.settings.useGlobalSettings}
                        />
                      </div>
                      <div className="py-1">
                        <div className="mb-2">
                          <p className="text-sm font-medium text-white">Keywords</p>
                          <p className="text-xs text-kol-text-muted mt-0.5">Highlight tweets containing these keywords</p>
                        </div>
                        <KeywordInput
                          keywords={selectedGroup.settings.filters?.keywords ?? []}
                          onChange={(v) => updateGroupFilters(selectedGroupId, {
                            ...selectedGroup.settings.filters,
                            filterTokenSymbols: selectedGroup.settings.filters?.filterTokenSymbols ?? false,
                            filterMintAddresses: selectedGroup.settings.filters?.filterMintAddresses ?? false,
                            keywords: v,
                          })}
                          disabled={selectedGroup.settings.useGlobalSettings}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tweet Types Section */}
                  <div className="pt-2 border-t border-kol-border/20">
                    <div className="mb-2">
                      <span className="text-[10px] text-kol-text-muted uppercase tracking-wide font-medium">
                        Tweet Types
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {(Object.keys(TWEET_TYPE_LABELS) as TweetTypeKey[]).map(typeKey => (
                        <TweetTypeRow
                          key={typeKey}
                          typeKey={typeKey}
                          label={TWEET_TYPE_LABELS[typeKey]}
                          settings={selectedGroup.settings.tweetTypes[typeKey]}
                          groupDefaults={globalSettings.tweetTypes[typeKey]}
                          onChange={(updates) => updateGroupTweetType(selectedGroupId, typeKey, updates)}
                          accountDefaultPlatform={PLATFORM_OPTIONS.find(p => p.id === selectedGroup.settings.defaultLaunchPlatform)?.label}
                        />
                      ))}
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
