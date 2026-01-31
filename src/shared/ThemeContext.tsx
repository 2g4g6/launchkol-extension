import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { THEMES, getThemeById, generateAccentVariants, CSS_VAR_KEYS } from './themes'
import type { ThemeDefinition } from './themes'

interface ThemeState {
  themeId: string
  customAccentColor?: string
  customFontUrl?: string
  customFontFamily?: string
}

interface ThemeContextValue {
  themeId: string
  setThemeId: (id: string) => void
  customAccentColor: string | undefined
  setCustomAccentColor: (color: string | undefined) => void
  customFontUrl: string | undefined
  customFontFamily: string | undefined
  setCustomFont: (url: string | undefined, family: string | undefined) => void
  activeTheme: ThemeDefinition
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'launchkol-theme'

function getStorage(): {
  get: (key: string) => Promise<Record<string, unknown>>
  set: (data: Record<string, unknown>) => Promise<void>
  onChanged?: typeof chrome.storage.onChanged
} {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return {
      get: (key) => chrome.storage.local.get(key),
      set: (data) => chrome.storage.local.set(data),
      onChanged: chrome.storage.onChanged,
    }
  }
  return {
    get: async (key) => {
      const raw = localStorage.getItem(key)
      return raw ? { [key]: JSON.parse(raw) } : {}
    },
    set: async (data) => {
      for (const [k, v] of Object.entries(data)) {
        localStorage.setItem(k, JSON.stringify(v))
      }
    },
  }
}

function applyThemeToDOM(theme: ThemeDefinition, customAccent?: string, customFontUrl?: string, customFontFamily?: string) {
  const root = document.documentElement
  const vars = { ...theme.variables }

  if (customAccent) {
    const variants = generateAccentVariants(customAccent)
    vars['--kol-blue'] = variants.blue
    vars['--kol-blue-hover'] = variants.blueHover
    vars['--kol-blue-glow'] = variants.blueGlow
  }

  if (customFontFamily) {
    vars['--font-display'] = `"${customFontFamily}"`
    vars['--font-body'] = `"${customFontFamily}"`
  }

  for (const key of CSS_VAR_KEYS) {
    root.style.setProperty(key, vars[key])
  }

  // Inject Google Font link if needed
  const existingLink = document.getElementById('kol-custom-font') as HTMLLinkElement | null
  if (customFontUrl) {
    if (existingLink) {
      if (existingLink.href !== customFontUrl) {
        existingLink.href = customFontUrl
      }
    } else {
      const link = document.createElement('link')
      link.id = 'kol-custom-font'
      link.rel = 'stylesheet'
      link.href = customFontUrl
      document.head.appendChild(link)
    }
  } else if (existingLink) {
    existingLink.remove()
  }
}

function parseFontFamilyFromUrl(url: string): string | undefined {
  try {
    const u = new URL(url)
    const family = u.searchParams.get('family')
    if (family) {
      // "Roboto:wght@400;700" -> "Roboto"
      return family.split(':')[0].replace(/\+/g, ' ')
    }
  } catch {
    // ignore
  }
  return undefined
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>({ themeId: 'dark' })
  const [loaded, setLoaded] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Load from storage on mount
  useEffect(() => {
    const storage = getStorage()
    storage.get(STORAGE_KEY).then((result) => {
      const saved = result[STORAGE_KEY] as ThemeState | undefined
      if (saved?.themeId) {
        setState(saved)
      }
      setLoaded(true)
    })
  }, [])

  // Apply theme whenever state changes
  useEffect(() => {
    if (!loaded) return
    const theme = getThemeById(state.themeId) ?? THEMES[0]
    applyThemeToDOM(theme, state.customAccentColor, state.customFontUrl, state.customFontFamily)
  }, [state, loaded])

  // Persist to storage (debounced)
  useEffect(() => {
    if (!loaded) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const storage = getStorage()
      storage.set({ [STORAGE_KEY]: state })
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [state, loaded])

  // Listen for storage changes (cross-popup/sidepanel sync)
  useEffect(() => {
    const storage = getStorage()
    if (!storage.onChanged) return

    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && changes[STORAGE_KEY]?.newValue) {
        setState(changes[STORAGE_KEY].newValue as ThemeState)
      }
    }
    storage.onChanged.addListener(listener)
    return () => storage.onChanged?.removeListener(listener)
  }, [])

  const setThemeId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, themeId: id, customAccentColor: undefined }))
  }, [])

  const setCustomAccentColor = useCallback((color: string | undefined) => {
    setState((prev) => ({ ...prev, customAccentColor: color }))
  }, [])

  const setCustomFont = useCallback((url: string | undefined, family: string | undefined) => {
    const parsedFamily = url ? (family || parseFontFamilyFromUrl(url)) : undefined
    setState((prev) => ({
      ...prev,
      customFontUrl: url,
      customFontFamily: parsedFamily,
    }))
  }, [])

  const activeTheme = getThemeById(state.themeId) ?? THEMES[0]

  return (
    <ThemeContext.Provider
      value={{
        themeId: state.themeId,
        setThemeId,
        customAccentColor: state.customAccentColor,
        setCustomAccentColor,
        customFontUrl: state.customFontUrl,
        customFontFamily: state.customFontFamily,
        setCustomFont,
        activeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
