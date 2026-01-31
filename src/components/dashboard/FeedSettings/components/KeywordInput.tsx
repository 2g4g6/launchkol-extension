import { useState, useRef } from 'react'
import { KeywordRow } from './KeywordRow'
import { KeywordFormPopover } from './KeywordFormPopover'
import type { Keyword } from '../types'

export interface KeywordInputProps {
  keywords: Keyword[]
  onChange: (keywords: Keyword[]) => void
  disabled?: boolean
  title?: string
  description?: string
}

// Generate a unique ID for keywords
function generateKeywordId(): string {
  return `kw_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function KeywordInput({
  keywords,
  onChange,
  disabled,
  title = 'Keywords',
  description = 'Highlight tweets containing these keywords',
}: KeywordInputProps) {
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
      notification: keywordData.notification,
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
    <div>
      {/* Header with title and add button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <i className="ri-search-eye-line text-kol-text-muted" />
            <p className="text-sm max-sm:text-base font-medium text-white">{title}</p>
          </div>
          {description && (
            <p className="text-xs max-sm:text-sm text-kol-text-muted mt-0.5">{description}</p>
          )}
        </div>

        {/* Add Keyword Button */}
        <button
          ref={addButtonRef}
          onClick={() => setIsPopoverOpen(true)}
          disabled={disabled}
          className={`
            inline-flex items-center gap-1 px-2 py-1 max-sm:px-3 max-sm:py-2 text-xs max-sm:text-sm
            text-kol-blue hover:text-kol-blue-hover
            border border-kol-blue/30 hover:border-kol-blue/50
            rounded-lg transition-colors flex-shrink-0
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <i className="ri-add-line" />
          Add
        </button>
      </div>

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
      {keywords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 px-4 rounded-lg border border-dashed border-kol-border/60 bg-kol-surface/30">
          <div className="w-10 h-10 max-sm:w-12 max-sm:h-12 rounded-full bg-kol-blue/10 flex items-center justify-center mb-3">
            <i className="ri-search-eye-line text-lg text-kol-blue/60" />
          </div>
          <p className="text-sm text-kol-text-muted mb-1">No keywords yet</p>
          <p className="text-xs text-kol-text-muted/50 text-center">
            Add keywords to highlight matching tweets in your feed
          </p>
        </div>
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
