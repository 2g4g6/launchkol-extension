import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../shared/ThemeContext'
import { THEMES } from '../../shared/themes'

function ThemePreview({
  theme,
  isActive,
  onClick,
}: {
  theme: typeof THEMES[number]
  isActive: boolean
  onClick: () => void
}) {
  const bg = theme.variables['--kol-bg']
  const surface = theme.variables['--kol-surface']
  const accent = theme.accent
  const border = theme.variables['--kol-border']
  const text = theme.variables['--kol-text']

  return (
    <button
      onClick={onClick}
      className="relative rounded-lg overflow-hidden transition-all duration-150"
      style={{
        outline: isActive ? `2px solid ${accent}` : '2px solid transparent',
        outlineOffset: '1px',
      }}
    >
      {/* Mini preview */}
      <div
        className="w-full aspect-[4/3] p-1.5 flex flex-col gap-1"
        style={{ background: bg, border: `1px solid ${border}` , borderRadius: '8px' }}
      >
        {/* Header bar */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
          <div className="flex-1 h-1 rounded-full" style={{ background: surface }} />
        </div>
        {/* Content blocks */}
        <div className="flex-1 flex gap-1">
          <div className="flex-1 rounded" style={{ background: surface }} />
          <div className="w-2/5 rounded" style={{ background: accent, opacity: 0.3 }} />
        </div>
        {/* Footer */}
        <div className="h-1 rounded-full" style={{ background: border }} />
      </div>
      {/* Label */}
      <div className="py-1 text-center">
        <span className="text-[10px] font-body" style={{ color: isActive ? accent : text }}>
          {theme.name}
        </span>
      </div>
    </button>
  )
}

export function ThemeCardContent() {
  const { themeId, setThemeId, customAccentColor, setCustomAccentColor, customFontUrl, setCustomFont } = useTheme()
  const [accentInput, setAccentInput] = useState(customAccentColor ?? '')
  const [fontUrlInput, setFontUrlInput] = useState(customFontUrl ?? '')
  const [fontFamilyInput, setFontFamilyInput] = useState('')

  const activeTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0]

  function handleAccentChange(value: string) {
    setAccentInput(value)
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setCustomAccentColor(value)
    }
  }

  function handleAccentReset() {
    setAccentInput('')
    setCustomAccentColor(undefined)
  }

  function handleFontSubmit() {
    if (!fontUrlInput) {
      setCustomFont(undefined, undefined)
      return
    }
    if (fontUrlInput.startsWith('https://fonts.googleapis.com/')) {
      setCustomFont(fontUrlInput, fontFamilyInput || undefined)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Theme grid */}
      <div>
        <p className="text-[11px] text-kol-text-muted font-body mb-2 uppercase tracking-wider">Presets</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((theme) => (
            <ThemePreview
              key={theme.id}
              theme={theme}
              isActive={theme.id === themeId}
              onClick={() => setThemeId(theme.id)}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-kol-border" />

      {/* Primary color */}
      <div>
        <p className="text-[11px] text-kol-text-muted font-body mb-1.5 uppercase tracking-wider">Primary Color</p>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md border border-kol-border flex-shrink-0"
            style={{ background: customAccentColor || activeTheme.accent }}
          />
          <div className="flex-1 relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-kol-text-muted text-[11px] font-mono">#</span>
            <input
              type="text"
              value={accentInput.replace('#', '')}
              onChange={(e) => handleAccentChange('#' + e.target.value.replace('#', ''))}
              placeholder={activeTheme.accent.replace('#', '')}
              maxLength={6}
              className="w-full bg-kol-surface border border-kol-border rounded-md px-2 pl-5 py-1.5 text-[12px] text-kol-text font-mono focus:border-kol-blue transition-colors"
            />
          </div>
          {customAccentColor && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleAccentReset}
              className="text-kol-text-muted hover:text-kol-text transition-colors flex-shrink-0"
              title="Reset to theme default"
            >
              <i className="ri-refresh-line text-sm" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-kol-border" />

      {/* Custom font */}
      <div>
        <p className="text-[11px] text-kol-text-muted font-body mb-1.5 uppercase tracking-wider">Custom Font</p>
        <input
          type="text"
          value={fontUrlInput}
          onChange={(e) => setFontUrlInput(e.target.value)}
          onBlur={handleFontSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleFontSubmit()}
          placeholder="https://fonts.googleapis.com/css2?family=..."
          className="w-full bg-kol-surface border border-kol-border rounded-md px-2 py-1.5 text-[11px] text-kol-text font-mono focus:border-kol-blue transition-colors mb-1.5"
        />
        {fontUrlInput && (
          <input
            type="text"
            value={fontFamilyInput}
            onChange={(e) => setFontFamilyInput(e.target.value)}
            onBlur={handleFontSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleFontSubmit()}
            placeholder="Font family name (e.g. Inter)"
            className="w-full bg-kol-surface border border-kol-border rounded-md px-2 py-1.5 text-[11px] text-kol-text font-body focus:border-kol-blue transition-colors mb-1.5"
          />
        )}
        <a
          href="https://fonts.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-kol-text-muted hover:text-kol-blue transition-colors font-body"
        >
          Browse fonts at fonts.google.com
        </a>
      </div>
    </div>
  )
}
