import { useState, useRef } from 'react'

export interface KeywordInputProps {
  keywords: string[]
  onChange: (keywords: string[]) => void
  disabled?: boolean
}

export function KeywordInput({ keywords, onChange, disabled }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addKeyword()
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      // Remove last keyword when backspace on empty input
      onChange(keywords.slice(0, -1))
    }
  }

  const addKeyword = () => {
    const trimmed = inputValue.trim().toLowerCase()
    if (trimmed && !keywords.includes(trimmed)) {
      onChange([...keywords, trimmed])
    }
    setInputValue('')
  }

  const removeKeyword = (keyword: string) => {
    onChange(keywords.filter(k => k !== keyword))
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`
        min-h-[32px] px-2 py-1 rounded-lg bg-kol-surface/50 border border-kol-border/50
        flex flex-wrap items-center gap-1.5 cursor-text transition-colors
        focus-within:border-kol-blue/50
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {keywords.map(keyword => (
        <span
          key={keyword}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-kol-blue/20 text-kol-blue rounded text-xs"
        >
          {keyword}
          {!disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeKeyword(keyword)
              }}
              className="hover:text-white transition-colors"
            >
              <i className="ri-close-line text-[10px]" />
            </button>
          )}
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addKeyword}
        placeholder={keywords.length === 0 ? "Type keywords, press Enter..." : ""}
        disabled={disabled}
        className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-xs text-white placeholder:text-kol-text-muted/50"
      />
    </div>
  )
}
