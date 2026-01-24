import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  animated?: boolean
}

export function Logo({ size = 'md', showText = true, animated = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, fontSize: 14 },
    md: { icon: 32, fontSize: 18 },
    lg: { icon: 56, fontSize: 26 },
  }

  const { icon, fontSize } = sizes[size]

  const logoVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
  }

  const textVariants = {
    initial: { opacity: 0, x: -10 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
    },
  }

  const Wrapper = animated ? motion.div : 'div'
  const IconWrapper = animated ? motion.div : 'div'
  const TextWrapper = animated ? motion.div : 'div'

  return (
    <Wrapper
      className="flex items-center gap-1"
      {...(animated && { initial: "initial", animate: "animate" })}
    >
      <IconWrapper
        className="relative"
        {...(animated && { variants: logoVariants })}
      >
        {/* Glow effect behind logo */}
        <div
          className="absolute inset-0 blur-xl opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(0, 123, 255, 0.6) 0%, transparent 70%)',
            transform: 'scale(1.5)',
          }}
        />

        {/* Logo Icon */}
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 1024 1024"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(0, 123, 255, 0.3))',
            shapeRendering: 'geometricPrecision',
            fillRule: 'evenodd',
            clipRule: 'evenodd',
          }}
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e0e0e0" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <g>
            <path
              fill="url(#logoGradient)"
              d="M 491.5,172.5 C 504.85,172.167 518.183,172.501 531.5,173.5C 578.5,250.833 625.5,328.167 672.5,405.5C 651.508,406.666 630.508,406.833 609.5,406C 576.208,352.584 543.041,299.084 510,245.5C 467.5,317.167 425,388.833 382.5,460.5C 489.833,461.167 597.167,461.833 704.5,462.5C 759.047,554.432 813.714,646.266 868.5,738C 860.092,752.815 851.425,767.482 842.5,782C 742.833,782.667 643.167,782.667 543.5,782C 542.84,764.239 542.84,746.406 543.5,728.5C 628.836,728.833 714.169,728.5 799.5,727.5C 758.046,657.417 715.712,587.917 672.5,519C 542.5,518.667 412.5,518.333 282.5,518C 322.962,452.248 362.795,386.081 402,319.5C 432.849,271.139 462.682,222.139 491.5,172.5 Z"
            />
          </g>
          <g>
            <path
              fill="url(#logoGradient)"
              d="M 256.5,572.5 C 277.844,572.167 299.177,572.5 320.5,573.5C 287.842,624.339 256.175,675.839 225.5,728C 309.833,728.5 394.166,728.667 478.5,728.5C 478.5,746.5 478.5,764.5 478.5,782.5C 379.499,782.667 280.499,782.5 181.5,782C 172.291,767.748 162.958,753.581 153.5,739.5C 188.095,683.973 222.428,628.306 256.5,572.5 Z"
            />
          </g>
        </svg>
      </IconWrapper>

      {showText && (
        <TextWrapper
          className="flex items-baseline gap-1.5"
          {...(animated && { variants: textVariants })}
        >
          <span
            className="text-white"
            style={{ fontSize: `${fontSize}px`, fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}
          >
            LAUNCH
          </span>
          <span
            className="text-white/45"
            style={{ fontSize: `${fontSize * 0.9}px`, fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 500, letterSpacing: '0.02em' }}
          >
            KOL
          </span>
        </TextWrapper>
      )}
    </Wrapper>
  )
}
