import { useState, useRef } from 'react'
import { KeywordBadge } from './KeywordBadge'
import { KeywordFormPopover } from './KeywordFormPopover'
import type { Keyword } from '../types'

export interface KeywordInputProps {
  keywords: Keyword[]
  onChange: (keywords: Keyword[]) => void
  disabled?: boolean
}

// Generate a unique ID for keywords
function generateKeywordId(): string {
  return `kw_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function KeywordInput({ keywords, onChange, disabled }: KeywordInputProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const editAnchorRef = useRef<HTMLSpanElement>(null)

  const handleAddKeyword = (keywordData: Omit<Keyword, 'id'> & { id?: string }) => {
    const newKeyword: Keyword = {
      id: generateKeywordId(),
      text: keywordData.text,
      color: keywordData.color,
      caseSensitive: keywordData.caseSensitive,
      wholeWord: keywordData.wholeWord,
      enabled: keywordData.enabled,
    }
    onChange([...keywords, newKeyword])
  }

  const handleEditKeyword = (keywordData: Omit<Keyword, 'id'> & { id?: string }) => {
    if (!keywordData.id) return
    onChange(keywords.map(kw =>
      kw.id === keywordData.id
        ? {
            ...kw,
            text: keywordData.text,
            color: keywordData.color,
            caseSensitive: keywordData.caseSensitive,
            wholeWord: keywordData.wholeWord,
          }
        : kw
    ))
  }

  const handleDeleteKeyword = (id: string) => {
    onChange(keywords.filter(kw => kw.id !== id))
  }

  const handleToggleEnabled = (id: string) => {
    onChange(keywords.map(kw =>
      kw.id === id ? { ...kw, enabled: !kw.enabled } : kw
    ))
  }

  const handleOpenAdd = () => {
    setEditingKeyword(null)
    setIsPopoverOpen(true)
  }

  const handleOpenEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword)
    setIsPopoverOpen(true)
  }

  const handleClosePopover = () => {
    setIsPopoverOpen(false)
    setEditingKeyword(null)
  }

  const handleSave = (keywordData: Omit<Keyword, 'id'> & { id?: string }) => {
    if (editingKeyword) {
      handleEditKeyword(keywordData)
    } else {
      handleAddKeyword(keywordData)
    }
  }

  // Use the add button as anchor for both add and edit (simpler approach)
  const anchorRef = editingKeyword ? editAnchorRef : addButtonRef

  return (
    <div className="space-y-2">
      {/* Add Keyword Button */}
      <button
        ref={addButtonRef}
        onClick={handleOpenAdd}
        disabled={disabled}
        className={`
          inline-flex items-center gap-1 px-2 py-1 text-xs
          text-kol-blue hover:text-kol-blue-hover
          border border-kol-blue/30 hover:border-kol-blue/50
          rounded-lg transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <i className="ri-add-line" />
        Add Keyword
      </button>

      {/* Keywords List */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {keywords.map(keyword => (
            <span
              key={keyword.id}
              ref={editingKeyword?.id === keyword.id ? editAnchorRef : undefined}
            >
              <KeywordBadge
                keyword={keyword}
                onClick={() => handleOpenEdit(keyword)}
                onDelete={() => handleDeleteKeyword(keyword.id)}
                onToggleEnabled={() => handleToggleEnabled(keyword.id)}
                disabled={disabled}
              />
            </span>
          ))}
        </div>
      )}

      {/* Empty State */}
      {keywords.length === 0 && !disabled && (
        <p className="text-xs text-kol-text-muted/60">
          No keywords added yet. Click "Add Keyword" to start.
        </p>
      )}

      {/* Popover */}
      <KeywordFormPopover
        isOpen={isPopoverOpen}
        onClose={handleClosePopover}
        onSave={handleSave}
        editingKeyword={editingKeyword}
        anchorRef={anchorRef}
        existingKeywords={keywords}
      />
    </div>
  )
}
