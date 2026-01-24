import { useState, useEffect, useCallback } from 'react'

export interface User {
  email: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AUTH_STORAGE_KEY = 'launchkol_auth'

export function useAuthState() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Load initial auth state from chrome.storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([AUTH_STORAGE_KEY], (result) => {
        const storedAuth = result[AUTH_STORAGE_KEY]
        if (storedAuth?.user) {
          setAuthState({
            user: storedAuth.user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      })
    } else {
      // Fallback for dev environment without chrome API
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  // Listen for auth state changes from other extension contexts
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) {
      return
    }

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes[AUTH_STORAGE_KEY]) {
        const newValue = changes[AUTH_STORAGE_KEY].newValue
        setAuthState({
          user: newValue?.user || null,
          isLoading: false,
          isAuthenticated: !!newValue?.user,
        })
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  const setUser = useCallback((user: User | null) => {
    const newAuthData = user ? { user } : null

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [AUTH_STORAGE_KEY]: newAuthData }, () => {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
        })
      })
    } else {
      // Fallback for dev environment
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      })
    }
  }, [])

  const signOut = useCallback(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.remove([AUTH_STORAGE_KEY], () => {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      })
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  return {
    ...authState,
    setUser,
    signOut,
  }
}
