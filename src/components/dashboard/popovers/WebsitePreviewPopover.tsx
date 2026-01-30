import { LinkPreview } from '../SocialPost'

interface WebsitePreviewPopoverProps {
  websitePreview?: LinkPreview
  websiteUrl: string
}

export function WebsitePreviewPopoverContent({ websitePreview, websiteUrl }: WebsitePreviewPopoverProps) {
  if (!websitePreview) {
    return (
      <div className="p-3">
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-kol-blue hover:text-kol-blue-hover transition-colors"
        >
          <i className="ri-global-line text-base" />
          <span>Visit website</span>
          <i className="ri-external-link-line text-[11px]" />
        </a>
      </div>
    )
  }

  const displayUrl = websitePreview.url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <a
      href={websitePreview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Card content */}
      <div className="p-3 space-y-2">
        {/* Site name / URL */}
        <div className="flex items-center gap-1.5">
          {websitePreview.favicon && (
            <img
              src={websitePreview.favicon}
              alt=""
              className="w-3.5 h-3.5 rounded-sm object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <span className="text-[11px] text-kol-text-muted truncate">
            {websitePreview.siteName || displayUrl}
          </span>
        </div>

        {/* Title */}
        <div className="text-[13px] font-medium text-white group-hover:text-kol-blue-hover transition-colors leading-snug">
          {websitePreview.title}
        </div>

        {/* Description */}
        {websitePreview.description && (
          <div className="text-[12px] text-kol-text-muted leading-relaxed line-clamp-2">
            {websitePreview.description}
          </div>
        )}
      </div>

      {/* OG Image */}
      {websitePreview.image && (
        <div className="border-t border-kol-border/40">
          <img
            src={websitePreview.image}
            alt=""
            className="w-full h-[140px] object-cover rounded-b-lg"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
    </a>
  )
}
