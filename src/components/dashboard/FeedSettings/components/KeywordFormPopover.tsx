import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { ColorPicker } from './ColorPicker'
import { SoundPicker } from './SoundPicker'
import { ToggleSwitch } from './ToggleSwitch'
import { DEFAULT_KEYWORD_COLOR, DEFAULT_FILTER_NOTIFICATION } from '../constants'
import type { Keyword } from '../types'

export interface KeywordFormPopoverProps {
  isOpen: boolean
  onClose: () => void
  onSave: (keyword: Omit<Keyword, 'id'> & { id?: string }) => void
  editingKeyword?: Keyword | null
  anchorRef: React.RefObject<HTMLElement | null>
  existingKeywords: Keyword[]
}

export function KeywordFormPopover({
  isOpen,
  onClose,
  onSave,
  editingKeyword,
  anchorRef,
  existingKeywords
}: KeywordFormPopoverProps) {
  const [text, setText] = useState('')
  const [color, setColor] = useState(DEFAULT_KEYWORD_COLOR)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [desktopNotif, setDesktopNotif] = useState(DEFAULT_FILTER_NOTIFICATION.desktop)
  const [soundNotif, setSoundNotif] = useState(DEFAULT_FILTER_NOTIFICATION.sound)
  const [soundId, setSoundId] = useState(DEFAULT_FILTER_NOTIFICATION.soundId)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isEditing = Boolean(editingKeyword)

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset form when opening/closing or when editing keyword changes
  useEffect(() => {
    if (isOpen) {
      if (editingKeyword) {
        setText(editingKeyword.text)
        setColor(editingKeyword.color)
        setCaseSensitive(editingKeyword.caseSensitive)
        setWholeWord(editingKeyword.wholeWord)
        const notif = editingKeyword.notification ?? DEFAULT_FILTER_NOTIFICATION
        setDesktopNotif(notif.desktop)
        setSoundNotif(notif.sound)
        setSoundId(notif.soundId)
      } else {
        setText('')
        setColor(DEFAULT_KEYWORD_COLOR)
        setCaseSensitive(false)
        setWholeWord(false)
        setDesktopNotif(DEFAULT_FILTER_NOTIFICATION.desktop)
        setSoundNotif(DEFAULT_FILTER_NOTIFICATION.sound)
        setSoundId(DEFAULT_FILTER_NOTIFICATION.soundId)
      }
      setError(null)
      // Focus input after a short delay to ensure it's rendered
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, editingKeyword])

  // Calculate position
  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const popoverWidth = 280
    const popoverHeight = 240

    let top = rect.bottom + 8
    let left = rect.left

    // Keep within viewport bounds
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16
    }
    if (left < 16) {
      left = 16
    }
    if (top + popoverHeight > window.innerHeight - 16) {
      top = rect.top - popoverHeight - 8
    }

    setPosition({ top, left })
  }, [anchorRef])

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        anchorRef.current && !anchorRef.current.contains(target)
      ) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorRef])

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleSave = () => {
    const trimmedText = text.trim()
    if (!trimmedText) {
      setError('Keyword text is required')
      return
    }

    // Check for duplicates (excluding the current keyword if editing)
    const isDuplicate = existingKeywords.some(kw => {
      if (isEditing && editingKeyword && kw.id === editingKeyword.id) {
        return false
      }
      // Compare case-insensitively for duplicate check
      return kw.text.toLowerCase() === trimmedText.toLowerCase()
    })

    if (isDuplicate) {
      setError('This keyword already exists')
      return
    }

    onSave({
      id: editingKeyword?.id,
      text: trimmedText,
      color,
      caseSensitive,
      wholeWord,
      enabled: editingKeyword?.enabled ?? true,
      notification: { desktop: desktopNotif, sound: soundNotif, soundId },
    })
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  const popover = mounted && (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15 }}
          className="fixed w-[280px] p-4 bg-kol-bg border border-kol-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-[9999]"
          style={{ top: position.top, left: position.left }}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">
                {isEditing ? 'Edit Keyword' : 'Add Keyword'}
              </h3>
              <button
                onClick={onClose}
                className="text-kol-text-muted hover:text-white transition-colors"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            {/* Text input */}
            <div>
              <label className="block text-xs text-kol-text-muted mb-1">
                Keyword
              </label>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setError(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter keyword..."
                className={`
                  w-full px-3 py-2 rounded-lg bg-kol-surface/50 border text-sm text-white
                  placeholder:text-kol-text-muted/50 outline-none transition-colors
                  ${error ? 'border-kol-red' : 'border-kol-border/50 focus:border-kol-blue/50'}
                `}
              />
              {error && (
                <p className="mt-1 text-xs text-kol-red">{error}</p>
              )}
            </div>

            {/* Color picker */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-kol-text-muted">
                Highlight Color
              </label>
              <ColorPicker currentColor={color} onSelect={setColor} />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-kol-text-muted">
                  Case sensitive
                </label>
                <ToggleSwitch enabled={caseSensitive} onChange={setCaseSensitive} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-kol-text-muted">
                  Whole words only
                </label>
                <ToggleSwitch enabled={wholeWord} onChange={setWholeWord} />
              </div>
            </div>

            {/* Notification settings */}
            <div className="space-y-3 pt-2 border-t border-kol-border/20">
              <div className="flex items-center justify-between">
                <label className="text-xs text-kol-text-muted flex items-center gap-1.5">
                  <i className={desktopNotif ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
                  Desktop notification
                </label>
                <ToggleSwitch enabled={desktopNotif} onChange={setDesktopNotif} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-kol-text-muted flex items-center gap-1.5">
                  <i className={soundNotif ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
                  Sound notification
                </label>
                <div className="flex items-center gap-1.5">
                  <SoundPicker
                    currentSound={soundId}
                    onSelect={setSoundId}
                    enabled={soundNotif}
                  />
                  <ToggleSwitch enabled={soundNotif} onChange={setSoundNotif} />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-1.5 text-xs text-kol-text-muted hover:text-white border border-kol-border rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-1.5 text-xs text-white bg-kol-blue hover:bg-kol-blue-hover rounded-lg transition-colors"
              >
                {isEditing ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return mounted ? createPortal(popover, document.body) : null
}
