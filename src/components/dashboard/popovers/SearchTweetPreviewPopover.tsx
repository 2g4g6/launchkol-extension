import { SocialPost, SocialPostData } from '../SocialPost'
import type { TextHighlight } from '../../../utils/textHighlight'

interface SearchTweetPreviewPopoverProps {
  symbol: string
  searchTweets?: SocialPostData[]
  onSearchAll?: () => void
  highlights?: TextHighlight[]
}

export function SearchTweetPreviewPopoverContent({ symbol, searchTweets, onSearchAll, highlights }: SearchTweetPreviewPopoverProps) {
  if (!searchTweets || searchTweets.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 px-5">
        <div className="relative mb-3">
          <div className="w-11 h-11 rounded-xl bg-kol-surface-elevated/60 border border-kol-border/40 flex items-center justify-center">
            <i className="ri-search-line text-xl text-kol-text-muted" />
          </div>
          <div
            className="absolute inset-0 rounded-xl opacity-40 blur-lg -z-10"
            style={{ background: 'radial-gradient(circle, rgba(0, 123, 255, 0.2) 0%, transparent 70%)' }}
          />
        </div>
        <span className="text-sm font-medium text-white mb-0.5">No tweets yet</span>
        <span className="text-xs text-kol-text-muted text-center mb-3">
          No mentions of <span className="text-kol-text-secondary">${symbol}</span> found on X
        </span>
        {onSearchAll && (
          <button
            onClick={onSearchAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-kol-blue/10 border border-kol-blue/20 text-xs text-kol-blue hover:bg-kol-blue/20 transition-colors"
          >
            <i className="ri-search-line text-[11px]" />
            <span>Search on X</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <i className="ri-search-line text-sm text-kol-blue" />
        <span className="text-xs font-medium text-kol-text-muted">
          Tweets mentioning <span className="text-white">${symbol}</span>
        </span>
      </div>

      {/* Scrollable tweet list */}
      <div className="max-h-[300px] overflow-y-auto scrollbar-styled">
        {searchTweets.map((tweet, index) => (
          <div key={tweet.id}>
            {index > 0 && <div className="border-t border-kol-border/30" />}
            <SocialPost post={tweet} index={0} flat highlights={highlights} />
          </div>
        ))}
      </div>

      {/* Footer */}
      {onSearchAll && (
        <div className="border-t border-kol-border/30 px-3 py-2">
          <button
            onClick={onSearchAll}
            className="flex items-center gap-1.5 text-xs text-kol-blue hover:text-kol-blue-hover transition-colors w-full"
          >
            <i className="ri-search-line text-[11px]" />
            <span>Search all tweets</span>
            <i className="ri-arrow-right-line text-[11px] ml-auto" />
          </button>
        </div>
      )}
    </div>
  )
}
