import { ColorPicker } from './ColorPicker'
import { ToggleSwitch } from './ToggleSwitch'
import { Tooltip } from '../../../ui/Tooltip'
import type { Keyword } from '../types'

export interface KeywordRowProps {
  keyword: Keyword
  onChange: (updates: Partial<Keyword>) => void
  onDelete: () => void
  disabled?: boolean
}

export function KeywordRow({ keyword, onChange, onDelete, disabled }: KeywordRowProps) {
  return (
    <div
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded-lg
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
          flex-1 text-xs font-medium text-white truncate
          ${!keyword.enabled ? 'line-through text-kol-text-muted' : ''}
        `}
        style={{ color: keyword.enabled ? keyword.color : undefined }}
      >
        {keyword.text}
      </span>

      {/* Options */}
      <div className="flex items-center gap-3">
        {/* Case sensitive */}
        <Tooltip content="Match case exactly" position="top">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-kol-text-muted">Aa</span>
            <ToggleSwitch
              enabled={keyword.caseSensitive}
              onChange={(v) => onChange({ caseSensitive: v })}
            />
          </div>
        </Tooltip>

        {/* Whole word */}
        <Tooltip content="Match whole words only" position="top">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-kol-text-muted">[w]</span>
            <ToggleSwitch
              enabled={keyword.wholeWord}
              onChange={(v) => onChange({ wholeWord: v })}
            />
          </div>
        </Tooltip>

        {/* Enabled toggle */}
        <Tooltip content={keyword.enabled ? 'Disable keyword' : 'Enable keyword'} position="top">
          <button
            onClick={() => onChange({ enabled: !keyword.enabled })}
            className={`
              w-6 h-6 rounded flex items-center justify-center transition-colors
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
            className="w-6 h-6 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10 transition-colors"
          >
            <i className="ri-delete-bin-line text-sm" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
