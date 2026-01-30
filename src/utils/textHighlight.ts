// ============================================================================
// Text Highlighting Utilities
// ============================================================================

export type TextSegmentType = 'plain' | 'mention' | 'url' | 'ticker' | 'ca' | 'search'

export interface TextSegment {
  text: string
  type: TextSegmentType
  color?: string
}

export interface TextHighlight {
  pattern: string
  color: string
  type: 'ticker' | 'ca' | 'search'
}

/**
 * Check if a string looks like a Solana contract address (base58, 32-44 chars)
 */
export function isContractAddress(q: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q.trim())
}

/**
 * Tokenize text into typed segments for rendering with highlights.
 * Recognizes: @mentions, URLs, $TICKER symbols, and base58 contract addresses.
 * Optional `highlights` param adds custom search-match patterns.
 */
export function tokenizeText(text: string, highlights?: TextHighlight[]): TextSegment[] {
  // Build a combined regex with named-ish groups via alternation order:
  // 1. URLs (must come first to avoid partial matches)
  // 2. @mentions
  // 3. $TICKER symbols
  // 4. Contract addresses (base58, 32-44 chars)
  const patterns: string[] = [
    '(https?:\\/\\/[^\\s]+)',           // URLs
    '(@\\w+)',                          // @mentions
    '(\\$[A-Za-z][A-Za-z0-9]{0,9})(?=[\\s,.:;!?\\)\\]}\\"\'\\u2019]|$)', // $TICKER
    '(?<![A-Za-z0-9])([1-9A-HJ-NP-Za-km-z]{32,44})(?![A-Za-z0-9])',       // CA
  ]

  const combinedRegex = new RegExp(patterns.join('|'), 'g')

  const segments: TextSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = combinedRegex.exec(text)) !== null) {
    const matchedText = match[0]
    const matchStart = match.index

    // Add plain text before this match
    if (matchStart > lastIndex) {
      const plainText = text.slice(lastIndex, matchStart)
      segments.push(...splitByHighlights(plainText, highlights))
    }

    // Determine segment type
    if (match[1]) {
      // URL
      segments.push({ text: matchedText, type: 'url' })
    } else if (match[2]) {
      // @mention
      segments.push({ text: matchedText, type: 'mention' })
    } else if (match[3]) {
      // $TICKER
      const tickerHighlight = highlights?.find(
        (h) => h.type === 'ticker' && matchedText.replace(/^\$/, '').toLowerCase() === h.pattern.replace(/^\$/, '').toLowerCase()
      )
      segments.push({
        text: matchedText,
        type: tickerHighlight ? 'search' : 'ticker',
        color: tickerHighlight?.color ?? '#f59e0b',
      })
    } else if (match[4]) {
      // Contract address
      const caHighlight = highlights?.find(
        (h) => h.type === 'ca' && matchedText === h.pattern
      )
      segments.push({
        text: matchedText,
        type: caHighlight ? 'search' : 'ca',
        color: caHighlight?.color ?? '#8b5cf6',
      })
    }

    lastIndex = matchStart + matchedText.length
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex)
    segments.push(...splitByHighlights(remaining, highlights))
  }

  return segments
}

/**
 * Split plain text by search highlight patterns (for non-regex text matches).
 */
function splitByHighlights(text: string, highlights?: TextHighlight[]): TextSegment[] {
  if (!highlights || highlights.length === 0) {
    return text ? [{ text, type: 'plain' }] : []
  }

  // Find search-type highlights that match as substrings
  const searchHighlights = highlights.filter((h) => h.type === 'search')
  if (searchHighlights.length === 0) {
    return text ? [{ text, type: 'plain' }] : []
  }

  // Try each search highlight
  for (const hl of searchHighlights) {
    const escapedPattern = hl.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedPattern})`, 'gi')
    const parts = text.split(regex)

    if (parts.length <= 1) continue

    const segments: TextSegment[] = []
    for (const part of parts) {
      if (!part) continue
      if (part.toLowerCase() === hl.pattern.toLowerCase()) {
        segments.push({ text: part, type: 'search', color: hl.color })
      } else {
        segments.push({ text: part, type: 'plain' })
      }
    }
    return segments
  }

  return text ? [{ text, type: 'plain' }] : []
}
