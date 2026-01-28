import { PLATFORM_OPTIONS } from './FeedSettings/constants'

interface FooterProps {
  solPrice: number
  bnbPrice?: number
  chatUnreadCount?: number
  onFeesClick?: () => void
  onChatClick?: () => void
}

function VerticalDivider() {
  return <div className="h-[20px] w-[1px] bg-kol-border flex-shrink-0" />
}

function FooterIconButton({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: string
  label?: string
  badge?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1 px-1.5 py-1 hover:bg-kol-border/40 rounded transition-colors duration-150 flex-shrink-0"
    >
      <i className={`${icon} text-[14px] text-kol-text-muted`} />
      {label && (
        <span className="text-[12px] text-kol-text-muted font-body whitespace-nowrap">
          {label}
        </span>
      )}
      {badge && (
        <span className="w-[7px] h-[7px] rounded-full bg-kol-red absolute -top-0.5 -right-0.5" />
      )}
    </button>
  )
}

function RegionDropdown() {
  return (
    <button className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-kol-border/40 rounded transition-colors duration-150 flex-shrink-0">
      <i className="ri-global-line text-[12px] text-kol-text-muted" />
      <span className="text-[11px] text-kol-text-muted font-body whitespace-nowrap">GLOBAL</span>
      <i className="ri-arrow-down-s-line text-[10px] text-kol-text-muted" />
    </button>
  )
}

function BnbIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 18 18" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M3.57583 9L3.58452 12.0945L6.29036 13.6418V15.4535L2.00097 13.0088V8.09508L3.57583 9ZM3.57583 5.90546V7.70873L2 6.80288V4.99961L3.57583 4.09375L5.15939 4.99961L3.57583 5.90546ZM7.42036 4.99961L8.9962 4.09375L10.5797 4.99961L8.9962 5.90546L7.42036 4.99961Z" fill="#F0B90B" />
      <path d="M4.71436 11.4531V9.64141L6.29019 10.5473V12.3505L4.71436 11.4531ZM7.4202 14.2907L8.99603 15.1966L10.5796 14.2907V16.094L8.99603 16.9998L7.4202 16.094V14.2907ZM12.8396 4.99961L14.4154 4.09375L15.999 4.99961V6.80288L14.4154 7.70873V5.90546L12.8396 4.99961ZM14.4154 12.0945L14.4241 9L15.9999 8.09414V13.0079L11.7106 15.4526V13.6409L14.4154 12.0945Z" fill="#F0B90B" />
      <path d="M13.2853 11.4543L11.7095 12.3517V10.5484L13.2853 9.64258V11.4543Z" fill="#F0B90B" />
      <path d="M13.2854 6.54672L13.2941 8.35843L10.5805 9.9057V13.0077L9.00471 13.9052L7.42888 13.0077V9.9057L4.71532 8.35843V6.54672L6.29791 5.64087L8.99506 7.19564L11.7086 5.64087L13.2922 6.54672H13.2854ZM4.71436 3.45312L8.99603 1L13.2854 3.45312L11.7096 4.35898L8.99603 2.80421L6.29019 4.35898L4.71436 3.45312Z" fill="#F0B90B" />
    </svg>
  )
}

function PlatformPill() {
  return (
    <div className="relative rounded-full p-[1px] flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,220,130,0.4), rgba(168,85,247,0.4), rgba(255,179,71,0.4))' }}>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kol-surface">
        {PLATFORM_OPTIONS.slice(0, 3).map((p) => (
          <img key={p.id} src={p.icon} alt={p.label} className="w-4 h-4 rounded-full" />
        ))}
      </div>
    </div>
  )
}

function CryptoTicker({
  icon,
  iconElement,
  price,
  color,
  label,
}: {
  icon?: string
  iconElement?: React.ReactNode
  price: number
  color: string
  label: string
}) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {iconElement ?? <img src={icon} alt={label} className="w-3.5 h-3.5" />}
      <span className="text-[12px] font-body" style={{ color }}>
        ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
    </div>
  )
}

export function Footer({
  solPrice,
  bnbPrice,
  chatUnreadCount = 0,
  onFeesClick,
  onChatClick,
}: FooterProps) {
  return (
    <div className="h-[36px] flex-shrink-0 border-t border-kol-border bg-kol-bg/90 backdrop-blur-sm relative z-20 flex items-center justify-between px-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Center - platform pill (absolute center) */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <PlatformPill />
      </div>

      {/* Left section */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <FooterIconButton icon="ri-percent-line" label="Fees" onClick={onFeesClick} />
        <FooterIconButton
          icon="ri-chat-3-line"
          label="Chat"
          badge={chatUnreadCount > 0}
          onClick={onChatClick}
        />

        <VerticalDivider />

        <RegionDropdown />

        <span className="w-[6px] h-[6px] rounded-full bg-kol-green flex-shrink-0" />
        <span className="text-[11px] text-kol-green font-body whitespace-nowrap hidden lg:inline">
          Connected
        </span>

        <VerticalDivider />

        {/* Crypto prices */}
        <CryptoTicker
          icon="/images/solanaLogoMark.svg"
          price={solPrice}
          color="#14F195"
          label="SOL"
        />
        {bnbPrice != null && (
          <CryptoTicker
            iconElement={<BnbIcon className="w-3.5 h-3.5" />}
            price={bnbPrice}
            color="#F0B90B"
            label="BNB"
          />
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <FooterIconButton icon="ri-volume-up-line" />
        <FooterIconButton icon="ri-translate-2" />
        <FooterIconButton icon="ri-palette-line" />
        <FooterIconButton icon="ri-settings-3-line" />
        <VerticalDivider />
        <a
          href="https://discord.gg/launchkol"
          target="_blank"
          rel="noopener noreferrer"
          className="text-kol-text-muted hover:text-white transition-colors duration-150 px-1"
        >
          <i className="ri-discord-fill text-[14px]" />
        </a>
        <a
          href="https://x.com/launchkol"
          target="_blank"
          rel="noopener noreferrer"
          className="text-kol-text-muted hover:text-white transition-colors duration-150 px-1"
        >
          <i className="ri-twitter-x-line text-[14px]" />
        </a>
        <a
          href="https://docs.launchkol.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-kol-text-muted hover:text-white transition-colors duration-150 px-1"
        >
          <i className="ri-file-text-line text-[14px]" />
          <span className="text-[12px] font-body whitespace-nowrap">Docs</span>
        </a>
      </div>
    </div>
  )
}
