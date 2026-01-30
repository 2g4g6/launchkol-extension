import { useState } from 'react'
import { LinkPreview } from '../SocialPost'

interface WebsitePreviewPopoverProps {
  websitePreview?: LinkPreview
  websiteUrl: string
}

export function WebsitePreviewPopoverContent({ websitePreview, websiteUrl }: WebsitePreviewPopoverProps) {
  const [siteNameHovered, setSiteNameHovered] = useState(false)

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
  const siteName = websitePreview.siteName || new URL(websitePreview.url).hostname.replace(/^www\./, '')

  return (
    <a
      href={websitePreview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3 space-y-2">
        {/* Site name / URL toggle row — outside inner card */}
        <div className="flex items-center gap-1.5">
          {websitePreview.favicon && (
            <img
              src={websitePreview.favicon}
              alt=""
              className="w-3.5 h-3.5 rounded-sm object-cover flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <span
            className="text-[11px] text-kol-text-muted truncate inline-flex items-center gap-1 cursor-pointer"
            onMouseEnter={() => setSiteNameHovered(true)}
            onMouseLeave={() => setSiteNameHovered(false)}
          >
            {siteNameHovered ? displayUrl : siteName}
            <i className="ri-link text-[10px] opacity-50" />
          </span>
        </div>

        {/* Inner card: image + title + description */}
        <div className="border border-kol-border/40 rounded-lg bg-kol-surface-elevated overflow-hidden">
          {/* OG Image at top */}
          {websitePreview.image && (
            <img
              src={websitePreview.image}
              alt=""
              className="w-full h-[140px] object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}

          <div className="p-2.5 space-y-1.5">
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
        </div>
      </div>
    </a>
  )
}
