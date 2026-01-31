import { useTheme } from '../../shared/ThemeContext'
import { THEMES } from '../../shared/themes'

export function ThemeCardContent() {
  const { themeId, setThemeId } = useTheme()

  return (
    <div className="p-3 space-y-1.5">
      {THEMES.map((theme) => {
        const isActive = theme.id === themeId
        const bg = theme.variables['--kol-bg']
        const surface = theme.variables['--kol-surface']
        const accent = theme.accent
        const border = theme.variables['--kol-border']

        return (
          <button
            key={theme.id}
            onClick={() => setThemeId(theme.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors ${
              isActive
                ? 'bg-kol-blue/15 border border-kol-blue/40'
                : 'bg-kol-surface border border-kol-border hover:border-kol-blue/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {/* Color swatch preview */}
              <div
                className="w-5 h-5 rounded-md flex-shrink-0 overflow-hidden flex"
                style={{ border: `1px solid ${border}` }}
              >
                <div className="w-1/2 h-full" style={{ background: bg }} />
                <div className="w-1/4 h-full" style={{ background: surface }} />
                <div className="w-1/4 h-full" style={{ background: accent }} />
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-kol-blue' : 'text-white'}`}>
                {theme.name}
              </span>
            </div>
            {isActive && <i className="ri-check-line text-kol-blue text-base" />}
          </button>
        )
      })}
    </div>
  )
}
