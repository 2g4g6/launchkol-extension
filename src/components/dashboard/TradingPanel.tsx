import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MyCoinsTab } from './MyCoinsTab'
import { LaunchTab } from './LaunchTab'
import { TradeTab } from './TradeTab'

type Tab = 'coins' | 'launch' | 'trade'

interface TradingPanelProps {
  isOpen: boolean
  onToggle: () => void
  height: number
  onHeightChange: (height: number) => void
  minHeight?: number
  maxHeight?: number
}

export function TradingPanel({
  isOpen,
  onToggle,
  height,
  onHeightChange,
  minHeight = 150,
  maxHeight = 350,
}: TradingPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('coins')
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'coins', label: 'My Coins', icon: 'ri-coin-line' },
    { id: 'launch', label: 'Launch', icon: 'ri-rocket-line' },
    { id: 'trade', label: 'Trade', icon: 'ri-exchange-line' },
  ]

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragStartY.current = clientY
    dragStartHeight.current = height
  }, [height])

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const delta = dragStartY.current - clientY
    const newHeight = Math.min(maxHeight, Math.max(minHeight, dragStartHeight.current + delta))
    onHeightChange(newHeight)
  }, [isDragging, maxHeight, minHeight, onHeightChange])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Attach global mouse/touch handlers when dragging
  useState(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleDrag)
      window.addEventListener('touchend', handleDragEnd)
      return () => {
        window.removeEventListener('mousemove', handleDrag)
        window.removeEventListener('mouseup', handleDragEnd)
        window.removeEventListener('touchmove', handleDrag)
        window.removeEventListener('touchend', handleDragEnd)
      }
    }
  })

  const handleLaunch = (data: any) => {
    console.log('Launching token:', data)
    // TODO: Implement actual launch logic
  }

  const handleTrade = (data: any) => {
    console.log('Trading:', data)
    // TODO: Implement actual trade logic
  }

  return (
    <div className="flex flex-col">
      {/* Toggle Bar */}
      <motion.button
        onClick={onToggle}
        className="flex items-center justify-center gap-2 py-2 bg-kol-surface/80 border-t border-kol-border/50 hover:bg-kol-surface-elevated/50 transition-colors group"
        whileTap={{ scale: 0.995 }}
      >
        <motion.i
          className="ri-arrow-up-s-line text-kol-text-muted group-hover:text-kol-text-tertiary transition-colors"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        />
        <span className="text-[10px] font-body font-medium text-kol-text-muted group-hover:text-kol-text-tertiary transition-colors">
          {isOpen ? 'Close Panel' : 'Trading Panel'}
        </span>
        <motion.i
          className="ri-arrow-up-s-line text-kol-text-muted group-hover:text-kol-text-tertiary transition-colors"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>

      {/* Panel Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-kol-bg border-t border-kol-border/30 overflow-hidden"
            initial={{ height: 0 }}
            animate={{ height }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Drag Handle */}
            <div
              className="flex items-center justify-center h-2 cursor-ns-resize hover:bg-kol-surface-elevated/30 transition-colors group"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div className="w-8 h-0.5 rounded-full bg-kol-border/50 group-hover:bg-kol-border transition-colors" />
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-kol-border/30">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-body font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-kol-surface-elevated text-kol-text border border-kol-border/50'
                      : 'text-kol-text-muted hover:text-kol-text-tertiary hover:bg-kol-surface-elevated/30'
                  }`}
                >
                  <i className={`${tab.icon} text-xs`} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="h-[calc(100%-44px)] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  className="h-full"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'coins' && <MyCoinsTab balance={4.523} />}
                  {activeTab === 'launch' && <LaunchTab onLaunch={handleLaunch} />}
                  {activeTab === 'trade' && <TradeTab onTrade={handleTrade} balance={4.523} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
