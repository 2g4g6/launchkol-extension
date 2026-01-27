import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../constants'

const MAX_RECENT_COLORS = 8

/**
 * Hook for managing recent colors in chrome.storage.local
 * Returns up to 8 most recently used colors, with most recent first
 */
export function useRecentColors() {
  const [recentColors, setRecentColors] = useState<string[]>([])

  // Load recent colors from storage on mount
  useEffect(() => {
    const loadRecentColors = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          const result = await chrome.storage.local.get(STORAGE_KEYS.recentColors)
          if (result[STORAGE_KEYS.recentColors]) {
            setRecentColors(result[STORAGE_KEYS.recentColors])
          }
        }
      } catch (error) {
        console.error('Failed to load recent colors:', error)
      }
    }
    loadRecentColors()
  }, [])

  // Add a color to recent colors
  const addRecentColor = useCallback((hex: string) => {
    // Normalize to uppercase
    const normalizedHex = hex.toUpperCase()

    setRecentColors((prev) => {
      // Remove if already exists (will add to front)
      const filtered = prev.filter((c) => c.toUpperCase() !== normalizedHex)
      // Add to front and limit to max
      const updated = [normalizedHex, ...filtered].slice(0, MAX_RECENT_COLORS)

      // Persist to storage
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ [STORAGE_KEYS.recentColors]: updated }).catch((error) => {
          console.error('Failed to save recent colors:', error)
        })
      }

      return updated
    })
  }, [])

  return { recentColors, addRecentColor }
}
