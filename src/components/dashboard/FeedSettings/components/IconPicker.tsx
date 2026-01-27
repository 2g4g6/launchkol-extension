import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Tooltip } from '../../../ui/Tooltip'
import {
  ICON_DEFINITIONS,
  ICON_CATEGORIES,
  RECENT_ICONS_KEY,
  type IconCategory,
  type IconDefinition
} from '../constants'

export interface IconPickerProps {
  currentIcon: string
  onSelect: (icon: string) => void
}

const MAX_RECENT_ICONS = 7
const GRID_COLUMNS = 7

export function IconPicker({ currentIcon, onSelect }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<IconCategory | 'all'>('all')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])

  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Load recently used icons from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_ICONS_KEY)
      if (stored) {
        setRecentlyUsed(JSON.parse(stored))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter icons based on search and category
  const filteredIcons = useMemo(() => {
    let icons = ICON_DEFINITIONS

    // Filter by category
    if (activeCategory !== 'all') {
      icons = icons.filter(def => def.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      icons = icons.filter(def =>
        def.label.toLowerCase().includes(query) ||
        def.icon.toLowerCase().includes(query) ||
        def.keywords.some(kw => kw.toLowerCase().includes(query))
      )
    }

    return icons
  }, [activeCategory, searchQuery])

  // Get icon definition by icon string
  const getIconDef = useCallback((icon: string): IconDefinition | undefined => {
    return ICON_DEFINITIONS.find(def => def.icon === icon)
  }, [])

  // Get current icon label for aria-label
  const currentIconLabel = useMemo(() => {
    const def = getIconDef(currentIcon)
    return def?.label || 'Icon'
  }, [currentIcon, getIconDef])

  // Calculate dropdown position (position above the trigger)
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const dropdownWidth = 280
    const dropdownHeight = 340 // Approximate max height

    // Calculate position - prefer above the trigger
    let top = rect.top - dropdownHeight - 4
    let left = rect.left + rect.width / 2 - dropdownWidth / 2

    // If not enough space above, position below
    if (top < 8) {
      top = rect.bottom + 4
    }

    // Ensure dropdown stays within viewport horizontally
    if (left < 8) {
      left = 8
    } else if (left + dropdownWidth > window.innerWidth - 8) {
      left = window.innerWidth - dropdownWidth - 8
    }

    setDropdownPosition({ top, left })
  }, [])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      // Focus search input when opening
      setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    } else {
      // Reset state when closing
      setSearchQuery('')
      setActiveCategory('all')
      setFocusedIndex(-1)
    }
  }, [isOpen, updatePosition])

  // Handle icon selection
  const handleSelect = useCallback((icon: string) => {
    onSelect(icon)
    setIsOpen(false)

    // Update recently used
    setRecentlyUsed(prev => {
      const updated = [icon, ...prev.filter(i => i !== icon)].slice(0, MAX_RECENT_ICONS)
      try {
        localStorage.setItem(RECENT_ICONS_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage errors
      }
      return updated
    })
  }, [onSelect])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalIcons = filteredIcons.length
    if (totalIcons === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => {
          const next = prev + GRID_COLUMNS
          return next < totalIcons ? next : prev
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => {
          const next = prev - GRID_COLUMNS
          return next >= 0 ? next : prev
        })
        break
      case 'ArrowRight':
        e.preventDefault()
        setFocusedIndex(prev => {
          const next = prev + 1
          return next < totalIcons ? next : 0
        })
        break
      case 'ArrowLeft':
        e.preventDefault()
        setFocusedIndex(prev => {
          const next = prev - 1
          return next >= 0 ? next : totalIcons - 1
        })
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < totalIcons) {
          handleSelect(filteredIcons[focusedIndex].icon)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
        break
      case 'Tab':
        // Let tab work normally for accessibility
        break
    }
  }, [filteredIcons, focusedIndex, handleSelect])

  // Scroll focused icon into view
  useEffect(() => {
    if (focusedIndex >= 0 && gridRef.current) {
      const focusedButton = gridRef.current.querySelector(`[data-index="${focusedIndex}"]`)
      if (focusedButton) {
        focusedButton.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [focusedIndex])

  const dropdown = mounted && isOpen && (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="fixed w-[280px] bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999] flex flex-col"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          maxHeight: '340px'
        }}
        onKeyDown={handleKeyDown}
        role="listbox"
        aria-label="Select an icon"
        aria-activedescendant={focusedIndex >= 0 ? `icon-${filteredIcons[focusedIndex]?.icon}` : undefined}
      >
        {/* Search input */}
        <div className="p-2 border-b border-kol-border">
          <div className="relative">
            <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-kol-text-muted text-sm" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setFocusedIndex(-1)
              }}
              placeholder="Search icons..."
              className="w-full h-8 pl-8 pr-8 bg-kol-surface border border-kol-border rounded-md text-sm text-white placeholder:text-kol-text-muted focus:outline-none focus:border-kol-blue/50"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  searchInputRef.current?.focus()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-kol-text-muted hover:text-white"
              >
                <i className="ri-close-line text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 p-2 border-b border-kol-border overflow-x-auto scrollbar-hide">
          <button
            onClick={() => {
              setActiveCategory('all')
              setFocusedIndex(-1)
            }}
            className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-kol-blue/15 text-kol-blue'
                : 'text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated'
            }`}
          >
            All
          </button>
          {ICON_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                setFocusedIndex(-1)
              }}
              className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === cat.id
                  ? 'bg-kol-blue/15 text-kol-blue'
                  : 'text-kol-text-muted hover:text-white hover:bg-kol-surface-elevated'
              }`}
            >
              <i className={`${cat.icon} text-[10px]`} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Recently used section */}
        {recentlyUsed.length > 0 && !searchQuery && activeCategory === 'all' && (
          <div className="px-2 pt-2 pb-1 border-b border-kol-border">
            <div className="text-[10px] text-kol-text-muted mb-1.5 uppercase tracking-wide">Recent</div>
            <div className="grid grid-cols-7 gap-1">
              {recentlyUsed.map(icon => {
                const def = getIconDef(icon)
                return (
                  <Tooltip
                    key={`recent-${icon}`}
                    content={def?.label || icon}
                    delayShow={300}
                    position="top"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(icon)
                      }}
                      className={`
                        w-8 h-8 rounded flex items-center justify-center transition-colors
                        ${icon === currentIcon
                          ? 'bg-kol-blue/15 text-kol-blue ring-1 ring-kol-blue/30'
                          : 'hover:bg-kol-surface-elevated text-kol-text-muted hover:text-white'
                        }
                      `}
                      role="option"
                      aria-selected={icon === currentIcon}
                    >
                      <i className={`${icon} text-base`} />
                    </button>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        )}

        {/* Icon grid */}
        <div
          ref={gridRef}
          className="p-2 overflow-y-auto flex-1 min-h-0"
          style={{ maxHeight: '200px' }}
        >
          {filteredIcons.length > 0 ? (
            <div className="grid grid-cols-7 gap-1">
              {filteredIcons.map((iconDef, idx) => (
                <Tooltip
                  key={iconDef.icon}
                  content={iconDef.label}
                  delayShow={300}
                  position="top"
                >
                  <button
                    data-index={idx}
                    id={`icon-${iconDef.icon}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(iconDef.icon)
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`
                      w-8 h-8 rounded flex items-center justify-center transition-colors
                      ${iconDef.icon === currentIcon
                        ? 'bg-kol-blue/15 text-kol-blue ring-1 ring-kol-blue/30'
                        : focusedIndex === idx
                          ? 'bg-kol-surface-elevated text-white ring-1 ring-kol-border'
                          : 'hover:bg-kol-surface-elevated text-kol-text-muted hover:text-white'
                      }
                    `}
                    role="option"
                    aria-selected={iconDef.icon === currentIcon}
                  >
                    <i className={`${iconDef.icon} text-base`} />
                  </button>
                </Tooltip>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-kol-text-muted">
              <i className="ri-search-line text-2xl mb-2 opacity-50" />
              <span className="text-sm">No icons found</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-kol-blue hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer with count */}
        <div className="px-2 py-1.5 border-t border-kol-border text-[10px] text-kol-text-muted">
          {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
          {activeCategory !== 'all' && ` in ${ICON_CATEGORIES.find(c => c.id === activeCategory)?.label}`}
        </div>
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-6 h-6 rounded flex items-center justify-center hover:bg-kol-surface-elevated transition-colors flex-shrink-0"
        aria-label={`Current icon: ${currentIconLabel}. Click to change`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <i className={`${currentIcon} text-sm text-kol-text-muted`} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
