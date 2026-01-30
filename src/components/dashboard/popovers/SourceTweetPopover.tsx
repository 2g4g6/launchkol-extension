import { SocialPost, SocialPostData } from '../SocialPost'
import type { TextHighlight } from '../../../utils/textHighlight'

interface SourceTweetPopoverProps {
  sourceTweet?: SocialPostData
  twitterUrl?: string
  tweetLabel: string
  highlights?: TextHighlight[]
  onTokenClick?: (query: string) => void
}

export function SourceTweetPopoverContent({ sourceTweet, twitterUrl, tweetLabel, highlights, onTokenClick }: SourceTweetPopoverProps) {
  if (!sourceTweet) {
    return (
      <div className="p-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-kol-blue hover:text-kol-blue-hover transition-colors"
        >
          <i className="ri-external-link-line text-base" />
          <span>{tweetLabel}</span>
        </a>
      </div>
    )
  }

  return (
    <div className="max-h-[400px] overflow-y-auto scrollbar-styled">
      <SocialPost post={sourceTweet} index={0} flat highlights={highlights} onTokenClick={onTokenClick} />
    </div>
  )
}
