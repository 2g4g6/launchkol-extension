import { ColorPicker } from './ColorPicker'
import { SoundPicker } from './SoundPicker'
import { ToggleSwitch } from './ToggleSwitch'
import { Tooltip } from '../../../ui/Tooltip'
import type { Keyword } from '../types'
import { DEFAULT_FILTER_NOTIFICATION } from '../constants'

export interface KeywordRowProps {
  keyword: Keyword
  onChange: (updates: Partial<Keyword>) => void
  onDelete: () => void
  disabled?: boolean
}

export function KeywordRow({ keyword, onChange, onDelete, disabled }: KeywordRowProps) {
  const notification = keyword.notification ?? DEFAULT_FILTER_NOTIFICATION

  return (
    <div
      className={`
        flex items-center gap-2 px-2 py-1.5 max-sm:px-3 max-sm:py-2.5 rounded-lg
        bg-kol-surface/30 border border-kol-border/30
        transition-opacity
        ${!keyword.enabled ? 'opacity-50' : ''}
        ${disabled ? 'pointer-events-none opacity-40' : ''}
      `}
    >
      {/* Color picker */}
      <ColorPicker
        currentColor={keyword.color}
        onSelect={(color) => onChange({ color })}
      />

      {/* Keyword text */}
      <span
        className={`
          flex-1 text-xs max-sm:text-sm font-medium text-white truncate
          ${!keyword.enabled ? 'line-through text-kol-text-muted' : ''}
        `}
        style={{ color: keyword.enabled ? keyword.color : undefined }}
      >
        {keyword.text}
      </span>

      {/* Options */}
      <div className="flex items-center gap-1.5">
        {/* Case sensitive */}
        <Tooltip content="Match case exactly" position="top">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] max-sm:text-xs text-kol-text-muted">Aa</span>
            <ToggleSwitch
              enabled={keyword.caseSensitive}
              onChange={(v) => onChange({ caseSensitive: v })}
            />
          </div>
        </Tooltip>

        {/* Whole word */}
        <Tooltip content="Match whole words only" position="top">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] max-sm:text-xs text-kol-text-muted">[w]</span>
            <ToggleSwitch
              enabled={keyword.wholeWord}
              onChange={(v) => onChange({ wholeWord: v })}
            />
          </div>
        </Tooltip>

        {/* Desktop notification toggle */}
        <Tooltip content="Desktop notification" position="top">
          <button
            onClick={() => onChange({
              notification: { ...notification, desktop: !notification.desktop }
            })}
            className={`
              w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
              ${notification.desktop
                ? 'text-kol-blue bg-kol-blue/10'
                : 'text-kol-text-muted/40 hover:text-kol-text-muted'
              }
            `}
          >
            <i className={notification.desktop ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
          </button>
        </Tooltip>

        {/* Sound toggle */}
        <Tooltip content="Sound notification" position="top">
          <button
            onClick={() => onChange({
              notification: { ...notification, sound: !notification.sound }
            })}
            className={`
              w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
              ${notification.sound
                ? 'text-kol-blue bg-kol-blue/10'
                : 'text-kol-text-muted/40 hover:text-kol-text-muted'
              }
            `}
          >
            <i className={notification.sound ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
          </button>
        </Tooltip>
        <SoundPicker
          currentSound={notification.soundId}
          onSelect={(soundId) => onChange({
            notification: { ...notification, soundId }
          })}
          enabled={notification.sound}
        />

        {/* Enabled toggle */}
        <Tooltip content={keyword.enabled ? 'Disable keyword' : 'Enable keyword'} position="top">
          <button
            onClick={() => onChange({ enabled: !keyword.enabled })}
            className={`
              w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
              ${keyword.enabled
                ? 'text-kol-green hover:bg-kol-green/10'
                : 'text-kol-text-muted hover:bg-kol-surface-elevated'
              }
            `}
          >
            <i className={`text-sm ${keyword.enabled ? 'ri-eye-line' : 'ri-eye-off-line'}`} />
          </button>
        </Tooltip>

        {/* Delete button */}
        <Tooltip content="Delete keyword" position="top">
          <button
            onClick={onDelete}
            className="w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10 transition-colors"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
