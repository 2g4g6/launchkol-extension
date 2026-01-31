import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { THEMES, getThemeById, CSS_VAR_KEYS } from './themes'
import type { ThemeDefinition } from './themes'

interface ThemeState {
  themeId: string
}

interface ThemeContextValue {
  themeId: string
  setThemeId: (id: string) => void
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

function applyThemeToDOM(theme: ThemeDefinition) {
  const root = document.documentElement
  for (const key of CSS_VAR_KEYS) {
    root.style.setProperty(key, theme.variables[key])
  }
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
    applyThemeToDOM(theme)
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
    setState({ themeId: id })
  }, [])

  const activeTheme = getThemeById(state.themeId) ?? THEMES[0]

  return (
    <ThemeContext.Provider value={{ themeId: state.themeId, setThemeId, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
