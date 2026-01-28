import { PumpLogo, BagsLogo, BonkLogo } from '../ui/PlatformLogos'

interface FooterProps {
  balance: number
  solPrice: number
  ethPrice?: number
  btcPrice?: number
  chatUnreadCount?: number
  onWalletClick?: () => void
  onFeesClick?: () => void
  onChatClick?: () => void
  onLighthouseClick?: () => void
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

function FooterWalletButton({
  walletCount,
  balance,
  onClick,
}: {
  walletCount: number
  balance: number
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-kol-surface border border-kol-border/50 hover:border-kol-blue/30 transition-colors duration-150 flex-shrink-0"
    >
      <i className="ri-wallet-3-line text-[14px] text-kol-text-muted" />
      <span className="text-[12px] text-kol-text-muted font-body">{walletCount}</span>
      <img src="/images/solanaLogoMark.svg" alt="SOL" className="w-3 h-3" />
      <span className="text-[12px] text-white font-mono">{balance.toFixed(3)}</span>
      <i className="ri-arrow-down-s-line text-[12px] text-kol-text-muted" />
    </button>
  )
}

function PlatformPill() {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-kol-border/50 bg-kol-surface/50 flex-shrink-0">
      <PumpLogo className="w-4 h-4" />
      <BagsLogo className="w-4 h-4" />
      <BonkLogo className="w-4 h-4" />
    </div>
  )
}

function CryptoTicker({
  icon,
  price,
  color,
  label,
}: {
  icon: string
  price: number
  color: string
  label: string
}) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <img src={icon} alt={label} className="w-3.5 h-3.5" />
      <span className="text-[12px] font-mono" style={{ color }}>
        ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
    </div>
  )
}

function ConnectionPill() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-kol-green/10 flex-shrink-0">
      <span className="w-[6px] h-[6px] rounded-full bg-kol-green" />
      <span className="text-[11px] text-kol-green font-body whitespace-nowrap">
        Connection is stable
      </span>
    </div>
  )
}

export function Footer({
  balance,
  solPrice,
  ethPrice,
  btcPrice,
  chatUnreadCount = 0,
  onWalletClick,
  onFeesClick,
  onChatClick,
  onLighthouseClick,
}: FooterProps) {
  return (
    <div className="h-[36px] flex-shrink-0 border-t border-kol-border bg-kol-bg/90 backdrop-blur-sm relative z-20 flex items-center px-2 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Left section */}
      <span className="w-[6px] h-[6px] rounded-full bg-kol-green flex-shrink-0" />
      <span className="text-[11px] text-kol-green font-body whitespace-nowrap hidden lg:inline">
        Connected
      </span>

      <VerticalDivider />

      <FooterWalletButton walletCount={1} balance={balance} onClick={onWalletClick} />

      <VerticalDivider />

      <FooterIconButton icon="ri-settings-3-line" label="Settings" />
      <FooterIconButton icon="ri-percent-line" label="Fees" onClick={onFeesClick} />
      <FooterIconButton
        icon="ri-chat-3-line"
        label="Chat"
        badge={chatUnreadCount > 0}
        onClick={onChatClick}
      />

      <div className="hidden lg:flex items-center gap-1.5">
        <FooterIconButton icon="ri-share-circle-line" label="Social" />
        <FooterIconButton
          icon="ri-lightbulb-line"
          label="Lighthouse"
          onClick={onLighthouseClick}
        />
      </div>

      {/* Middle section - lg+ only */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-3">
        <PlatformPill />
        <VerticalDivider />
        <CryptoTicker
          icon="/images/solanaLogoMark.svg"
          price={solPrice}
          color="#14F195"
          label="SOL"
        />
        {ethPrice != null && (
          <CryptoTicker
            icon="/images/ethLogo.svg"
            price={ethPrice}
            color="#497493"
            label="ETH"
          />
        )}
        {btcPrice != null && (
          <CryptoTicker
            icon="/images/btcLogo.svg"
            price={btcPrice}
            color="#F7931A"
            label="BTC"
          />
        )}
      </div>

      {/* SOL price on mobile only */}
      <div className="flex lg:hidden items-center ml-auto">
        <CryptoTicker
          icon="/images/solanaLogoMark.svg"
          price={solPrice}
          color="#14F195"
          label="SOL"
        />
      </div>

      {/* Right section - lg+ only */}
      <div className="hidden lg:flex items-center gap-1.5 ml-auto">
        <FooterIconButton icon="ri-gas-station-line" />
        <ConnectionPill />
        <VerticalDivider />
        <FooterIconButton icon="ri-notification-3-line" />
        <FooterIconButton icon="ri-palette-line" />
        <VerticalDivider />
        <a
          href="https://discord.gg/launchkol"
          target="_blank"
          rel="noopener noreferrer"
          className="text-kol-text-muted hover:text-white transition-colors duration-150 px-1"
        >
          <i className="ri-discord-line text-[14px]" />
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
          className="text-kol-text-muted hover:text-white transition-colors duration-150 px-1"
        >
          <i className="ri-file-text-line text-[14px]" />
        </a>
      </div>
    </div>
  )
}
