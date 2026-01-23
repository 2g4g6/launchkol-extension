import { motion } from 'framer-motion'
import { Logo } from '../Logo'

type TabId = 'feed' | 'coins'

interface Tab {
  id: TabId
  label: string
  icon: string
}

const TABS: Tab[] = [
  { id: 'feed', label: 'Feed', icon: 'ri-radar-line' },
  { id: 'coins', label: 'Coins', icon: 'ri-coin-line' },
]

interface HeaderProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onSettingsClick: () => void
}

export function Header({ activeTab, onTabChange, onSettingsClick }: HeaderProps) {
  return (
    <motion.header
      className="relative flex items-center justify-between px-4 py-3 bg-transparent z-20"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glass-morphism background */}
      <div className="absolute inset-0 bg-kol-bg/60 backdrop-blur-xl border-b border-kol-border/30" />

      {/* Bottom edge glow line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 123, 255, 0.3) 50%, transparent 100%)',
        }}
      />

      {/* Logo */}
      <div className="relative z-10">
        <Logo size="md" showText={true} animated={false} />
      </div>

      {/* Right side: Tabs + Settings */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-kol-surface/40 backdrop-blur-sm border border-kol-border/20">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-kol-text-muted hover:text-kol-text-secondary'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeHeaderTab"
                  className="absolute inset-0 bg-kol-surface-elevated/80 backdrop-blur-sm border border-kol-border/40 rounded-lg"
                  style={{
                    boxShadow: '0 0 12px rgba(0, 123, 255, 0.15)',
                  }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <i className={`${tab.icon} text-[11px] relative z-10`} />
              <span className="relative z-10">{tab.label}</span>
              {tab.id === 'feed' && (
                <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-kol-red shadow-sm shadow-kol-red/50 animate-pulse" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Settings Button */}
        <motion.button
          onClick={onSettingsClick}
          className="relative w-8 h-8 rounded-xl bg-kol-surface/40 backdrop-blur-sm border border-kol-border/20 flex items-center justify-center text-kol-text-muted hover:text-white hover:border-kol-border/40 transition-all group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Hover glow */}
          <div className="absolute inset-0 rounded-xl bg-kol-blue/0 group-hover:bg-kol-blue/10 transition-colors" />
          <i className="ri-settings-3-line text-sm relative z-10" />
        </motion.button>
      </div>
    </motion.header>
  )
}
