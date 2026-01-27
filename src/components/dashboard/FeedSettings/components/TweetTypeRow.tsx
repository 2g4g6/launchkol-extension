import { Tooltip } from '../../../ui/Tooltip'
import type { TweetTypeKey, TweetTypeSettings } from '../types'
import { TWEET_TYPE_ICONS } from '../constants'
import { ColorPicker } from './ColorPicker'
import { InheritedIndicator } from './InheritedIndicator'
import { SoundPicker } from './SoundPicker'
import { PlatformPicker } from './PlatformPicker'

export interface TweetTypeRowProps {
  typeKey: TweetTypeKey
  label: string
  settings: Partial<TweetTypeSettings> | undefined
  groupDefaults: TweetTypeSettings
  onChange: (updates: Partial<TweetTypeSettings>) => void
  accountDefaultPlatform?: string
}

export function TweetTypeRow({ typeKey, label, settings, groupDefaults, onChange, accountDefaultPlatform }: TweetTypeRowProps) {
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
          h-5 px-2 rounded text-[10px] font-medium transition-colors border min-w-[60px] flex items-center gap-1
          ${effective.enabled
            ? 'bg-kol-blue/15 text-kol-blue border-kol-blue/50'
            : 'bg-kol-surface/45 border-kol-border text-kol-text-muted hover:bg-kol-surface-elevated'
          }
        `}
      >
        <i className={TWEET_TYPE_ICONS[typeKey]} />
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

      {/* Highlight toggle */}
      <Tooltip content="Highlight tweets" position="top">
        <button
          onClick={() => onChange({ highlightEnabled: !effective.highlightEnabled })}
          className={`
            w-6 h-6 rounded flex items-center justify-center transition-colors
            ${effective.highlightEnabled
              ? 'text-kol-blue bg-kol-blue/10'
              : 'text-kol-text-muted/40 hover:text-kol-text-muted'
            }
          `}
        >
          <i className={effective.highlightEnabled ? 'ri-mark-pen-fill' : 'ri-mark-pen-line'} />
        </button>
      </Tooltip>

      {/* Color picker - only show when highlight is enabled */}
      {effective.highlightEnabled && (
        <ColorPicker
          currentColor={effective.highlightColor}
          onSelect={(color) => onChange({ highlightColor: color })}
        />
      )}
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
