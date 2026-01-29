import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'

interface HorizontalScrollContainerProps {
  children: ReactNode
  className?: string
  /** Tailwind `from-` color for the gradient fade. Defaults to 'from-kol-bg' */
  gradientFrom?: string
}

export function HorizontalScrollContainer({
  children,
  className = '',
  gradientFrom = 'from-kol-bg',
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollable = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }, [])

  useEffect(() => {
    checkScrollable()
    const el = scrollRef.current
    if (!el) return

    const observer = new ResizeObserver(checkScrollable)
    observer.observe(el)

    return () => observer.disconnect()
  }, [checkScrollable])

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -100, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 100, behavior: 'smooth' })
  }

  return (
    <div className="relative min-w-0 overflow-hidden">
      {canScrollLeft && (
        <div className={`absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r ${gradientFrom} to-transparent pointer-events-none flex items-center justify-start`}>
          <button
            type="button"
            onClick={scrollLeft}
            className="pointer-events-auto flex items-center justify-center w-6 h-6 text-kol-text-muted hover:text-white transition-colors"
          >
            <i className="ri-arrow-left-s-line text-xl" />
          </button>
        </div>
      )}
      <div
        ref={scrollRef}
        onScroll={checkScrollable}
        className={className}
      >
        {children}
      </div>
      {canScrollRight && (
        <div className={`absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l ${gradientFrom} to-transparent pointer-events-none flex items-center justify-end`}>
          <button
            type="button"
            onClick={scrollRight}
            className="pointer-events-auto flex items-center justify-center w-6 h-6 text-kol-text-muted hover:text-white transition-colors"
          >
            <i className="ri-arrow-right-s-line text-xl" />
          </button>
        </div>
      )}
    </div>
  )
}
