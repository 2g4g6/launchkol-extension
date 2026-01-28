// Platform logo components using actual SVG assets from public/images/

interface LogoProps {
  className?: string
}

export function PumpLogo({ className }: LogoProps) {
  return <img src="/images/pump.svg" alt="Pump.fun" className={className} />
}

export function BonkLogo({ className }: LogoProps) {
  return <img src="/images/bonk.svg" alt="Bonk.fun" className={className} />
}

export function BagsLogo({ className }: LogoProps) {
  return <img src="/images/bags.svg" alt="Bags" className={className} />
}

export function FourMemeLogo({ className }: LogoProps) {
  return <img src="/images/fourmeme.svg" alt="Four.meme" className={className} />
}

export function MayhemLogo({ className }: LogoProps) {
  return <img src="/images/mayhem.svg" alt="Mayhem" className={className} />
}

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
  mayhem: MayhemLogo,
  fourmeme: FourMemeLogo,
  binance: BinanceLogo,
} as const

export type PlatformType = keyof typeof PlatformLogoMap
