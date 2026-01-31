import { useState } from 'react'

const LANGUAGES = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'zh', label: 'Chinese', native: '中文' },
]

export function LanguageCardContent() {
  const [selected, setSelected] = useState('en')

  return (
    <div className="p-3 space-y-1.5">
      {LANGUAGES.map((lang) => {
        const isActive = selected === lang.id
        return (
          <button
            key={lang.id}
            onClick={() => setSelected(lang.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors ${
              isActive
                ? 'bg-kol-blue/15 border border-kol-blue/40'
                : 'bg-kol-surface border border-kol-border hover:border-kol-blue/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${isActive ? 'text-kol-blue' : 'text-white'}`}>
                {lang.label}
              </span>
              <span className="text-[11px] text-kol-text-muted">{lang.native}</span>
            </div>
            {isActive && <i className="ri-check-line text-kol-blue text-base" />}
          </button>
        )
      })}
    </div>
  )
}
