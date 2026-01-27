import type { Keyword } from '../types'

export interface KeywordBadgeProps {
  keyword: Keyword
  onClick: () => void
  onDelete: () => void
  onToggleEnabled: () => void
  disabled?: boolean
}

export function KeywordBadge({
  keyword,
  onClick,
  onDelete,
  onToggleEnabled,
  disabled
}: KeywordBadgeProps) {
  // Calculate contrasting text color based on background
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#ffffff'
  }

  const textColor = getContrastColor(keyword.color)
  const isDisabled = !keyword.enabled

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
        transition-all cursor-pointer group
        ${isDisabled ? 'opacity-40' : 'hover:opacity-90'}
        ${disabled ? 'pointer-events-none' : ''}
      `}
      style={{
        backgroundColor: keyword.color,
        color: textColor,
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onClick()
      }}
    >
      <span className={isDisabled ? 'line-through' : ''}>
        {keyword.text}
      </span>

      {/* Options indicators */}
      {(keyword.caseSensitive || keyword.wholeWord) && (
        <span className="flex items-center gap-0.5 opacity-70 text-[9px]">
          {keyword.caseSensitive && <span title="Case sensitive">Aa</span>}
          {keyword.wholeWord && <span title="Whole word">[w]</span>}
        </span>
      )}

      {!disabled && (
        <span className="flex items-center gap-0.5 ml-0.5">
          {/* Toggle enabled button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleEnabled()
            }}
            className="opacity-60 hover:opacity-100 transition-opacity"
            title={isDisabled ? 'Enable keyword' : 'Disable keyword'}
          >
            <i className={`text-[10px] ${isDisabled ? 'ri-eye-off-line' : 'ri-eye-line'}`} />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="opacity-60 hover:opacity-100 transition-opacity"
            title="Delete keyword"
          >
            <i className="ri-close-line text-[10px]" />
          </button>
        </span>
      )}
    </span>
  )
}
