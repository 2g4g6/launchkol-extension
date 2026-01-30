import { SocialPost, SocialPostData } from '../SocialPost'

interface SearchTweetPreviewPopoverProps {
  symbol: string
  searchTweets?: SocialPostData[]
  onSearchAll?: () => void
}

export function SearchTweetPreviewPopoverContent({ symbol, searchTweets, onSearchAll }: SearchTweetPreviewPopoverProps) {
  if (!searchTweets || searchTweets.length === 0) {
    return (
      <div className="p-3">
        <div className="flex items-center gap-2 text-sm text-kol-text-muted">
          <i className="ri-search-line text-base" />
          <span>No tweets found for ${symbol}</span>
        </div>
        {onSearchAll && (
          <button
            onClick={onSearchAll}
            className="mt-2 flex items-center gap-1.5 text-xs text-kol-blue hover:text-kol-blue-hover transition-colors"
          >
            <span>Search all tweets</span>
            <i className="ri-arrow-right-line text-[11px]" />
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
            <SocialPost post={tweet} index={0} flat />
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
