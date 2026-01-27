import { useState, useRef } from 'react'
import { KeywordRow } from './KeywordRow'
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
  const addButtonRef = useRef<HTMLButtonElement>(null)

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

  const handleUpdateKeyword = (id: string, updates: Partial<Keyword>) => {
    onChange(keywords.map(kw =>
      kw.id === id ? { ...kw, ...updates } : kw
    ))
  }

  const handleDeleteKeyword = (id: string) => {
    onChange(keywords.filter(kw => kw.id !== id))
  }

  return (
    <div className="space-y-2">
      {/* Add Keyword Button */}
      <button
        ref={addButtonRef}
        onClick={() => setIsPopoverOpen(true)}
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

      {/* Keywords List - Row format */}
      {keywords.length > 0 && (
        <div className="space-y-1.5">
          {keywords.map(keyword => (
            <KeywordRow
              key={keyword.id}
              keyword={keyword}
              onChange={(updates) => handleUpdateKeyword(keyword.id, updates)}
              onDelete={() => handleDeleteKeyword(keyword.id)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {keywords.length === 0 && !disabled && (
        <p className="text-xs text-kol-text-muted/60">
          No keywords added yet. Click "Add Keyword" to start.
        </p>
      )}

      {/* Add Keyword Popover */}
      <KeywordFormPopover
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        onSave={handleAddKeyword}
        editingKeyword={null}
        anchorRef={addButtonRef}
        existingKeywords={keywords}
      />
    </div>
  )
}
