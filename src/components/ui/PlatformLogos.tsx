// Platform logo SVG components for use in SearchTokensModal
// Each logo is optimized for small sizes (12-16px)

interface LogoProps {
  className?: string
}

// Pump.fun logo - Green pill/capsule shape
export function PumpLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="12" height="8" rx="4" fill="url(#pump-gradient)" />
      <circle cx="5.5" cy="8" r="1.5" fill="white" fillOpacity="0.9" />
      <circle cx="10.5" cy="8" r="1.5" fill="white" fillOpacity="0.9" />
      <defs>
        <linearGradient id="pump-gradient" x1="2" y1="8" x2="14" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00DC82" />
          <stop offset="1" stopColor="#36E4DA" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Bonk logo - Orange/yellow shiba-inspired
export function BonkLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6" fill="url(#bonk-gradient)" />
      <ellipse cx="6" cy="7" rx="1" ry="1.2" fill="#1a1a1a" />
      <ellipse cx="10" cy="7" rx="1" ry="1.2" fill="#1a1a1a" />
      <path d="M6 10.5C6 10.5 7 11.5 8 11.5C9 11.5 10 10.5 10 10.5" stroke="#1a1a1a" strokeWidth="0.8" strokeLinecap="round" />
      <defs>
        <linearGradient id="bonk-gradient" x1="2" y1="2" x2="14" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB347" />
          <stop offset="1" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Bags logo - Purple money bag
export function BagsLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 4L6.5 2H9.5L11 4" stroke="url(#bags-gradient)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 6C4 5.44772 4.44772 5 5 5H11C11.5523 5 12 5.44772 12 6V12C12 13.1046 11.1046 14 10 14H6C4.89543 14 4 13.1046 4 12V6Z" fill="url(#bags-gradient)" />
      <text x="8" y="11" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">$</text>
      <defs>
        <linearGradient id="bags-gradient" x1="4" y1="2" x2="12" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Four.meme logo - Pink/magenta 4 shape
export function FourMemeLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="3" fill="url(#fourmeme-gradient)" />
      <path d="M9 4V12M6 4L6 9H11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="fourmeme-gradient" x1="2" y1="2" x2="14" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EC4899" />
          <stop offset="1" stopColor="#BE185D" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Binance/BNB logo - Yellow diamond
export function BinanceLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2L10.5 4.5L8 7L5.5 4.5L8 2Z" fill="#F3BA2F" />
      <path d="M12 6L14 8L12 10L10 8L12 6Z" fill="#F3BA2F" />
      <path d="M4 6L6 8L4 10L2 8L4 6Z" fill="#F3BA2F" />
      <path d="M8 9L10.5 11.5L8 14L5.5 11.5L8 9Z" fill="#F3BA2F" />
    </svg>
  )
}

// Export a map for easy lookup
export const PlatformLogoMap = {
  pump: PumpLogo,
  bonk: BonkLogo,
  bags: BagsLogo,
  fourmeme: FourMemeLogo,
  binance: BinanceLogo,
} as const

export type PlatformType = keyof typeof PlatformLogoMap
