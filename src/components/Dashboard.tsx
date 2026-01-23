import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './dashboard/Header'
import { TrackerFeed } from './dashboard/TrackerFeed'
import { MyCoinsTab } from './dashboard/MyCoinsTab'
import { SocialPostData } from './dashboard/SocialPost'
import { CoinData } from './dashboard/CoinCard'

type TabId = 'feed' | 'coins'

interface DashboardProps {
  user: { email: string }
  onSignOut: () => void
}

export function Dashboard({ user, onSignOut }: DashboardProps) {
  const [balance, setBalance] = useState(4.523)
  const [activeTab, setActiveTab] = useState<TabId>('feed')
  const [showSettings, setShowSettings] = useState(false)

  // Simulated balance fetch
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance(prev => prev + (Math.random() - 0.5) * 0.01)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleDeploy = (post: SocialPostData) => {
    console.log('Deploy from post:', post)
  }

  const handleSell = (coin: CoinData, percent: number) => {
    console.log(`Selling ${percent}% of ${coin.symbol}`)
  }

  return (
    <motion.div
      className="w-full h-full bg-[#050508] flex flex-col overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Premium layered background - matching auth screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient - deep space feel */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(15, 23, 42, 0.8) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(0, 40, 80, 0.3) 0%, transparent 50%)',
          }}
        />

        {/* Animated gradient orb - primary accent */}
        <motion.div
          className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(0, 123, 255, 0.25) 0%, rgba(0, 123, 255, 0.05) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Secondary accent orb - bottom left */}
        <motion.div
          className="absolute -bottom-16 -left-16 w-[200px] h-[200px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(0, 196, 107, 0.2) 0%, transparent 60%)',
            filter: 'blur(30px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -8, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Geometric grid - subtle tech pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 70%)',
          }}
        />

        {/* Accent lines - diagonal tech feel */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradDash" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#007bff" stopOpacity="0" />
              <stop offset="50%" stopColor="#007bff" stopOpacity="1" />
              <stop offset="100%" stopColor="#007bff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="100%" x2="40%" y2="0" stroke="url(#lineGradDash)" strokeWidth="1" />
          <line x1="60%" y1="100%" x2="100%" y2="30%" stroke="url(#lineGradDash)" strokeWidth="1" />
        </svg>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${10 + (i * 11) % 80}%`,
                top: `${15 + (i * 13) % 70}%`,
                background: i % 3 === 0 ? 'rgba(0, 123, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)',
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + (i % 3) * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        {/* Vignette overlay for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(5, 5, 8, 0.6) 100%)',
          }}
        />

        {/* Top edge glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0, 123, 255, 0.5) 50%, transparent 100%)',
            boxShadow: '0 0 20px 2px rgba(0, 123, 255, 0.3)',
          }}
        />

        {/* Film grain texture */}
        <div className="noise-overlay" />
      </div>

      {/* Header with Tab Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'feed' && (
              <TrackerFeed onDeploy={handleDeploy} />
            )}
            {activeTab === 'coins' && (
              <MyCoinsTab onSell={handleSell} balance={balance} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="relative w-[320px] bg-kol-surface-elevated/95 backdrop-blur-xl border border-kol-border/50 rounded-2xl p-5 shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-kol-blue/10 blur-3xl pointer-events-none" />

              <div className="relative flex items-center justify-between mb-5">
                <h3 className="font-display font-semibold text-base text-white">Settings</h3>
                <motion.button
                  onClick={() => setShowSettings(false)}
                  className="w-7 h-7 rounded-full bg-kol-surface/80 border border-kol-border/50 hover:border-kol-border hover:bg-kol-surface-elevated flex items-center justify-center transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="ri-close-line text-base text-kol-text-muted" />
                </motion.button>
              </div>

              <div className="relative space-y-4">
                {/* Account info */}
                <div className="p-3.5 bg-kol-surface/60 backdrop-blur-sm rounded-xl border border-kol-border/30">
                  <p className="text-[10px] text-kol-text-muted uppercase tracking-wider mb-1.5 font-medium">Account</p>
                  <p className="text-sm text-white font-body truncate">{user.email}</p>
                </div>

                {/* Quick settings */}
                <div className="space-y-1">
                  <SettingToggle label="Push notifications" defaultOn={true} />
                  <SettingToggle label="Auto-track launches" defaultOn={false} />
                  <SettingToggle label="Sound alerts" defaultOn={true} />
                </div>

                {/* Sign out */}
                <motion.button
                  onClick={onSignOut}
                  className="relative w-full py-2.5 rounded-xl border border-kol-red/30 text-kol-red text-xs font-display font-semibold overflow-hidden group mt-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="absolute inset-0 bg-kol-red/0 group-hover:bg-kol-red/10 transition-colors" />
                  <span className="relative">
                    <i className="ri-logout-box-line mr-2" />
                    Sign Out
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Premium toggle component for settings
function SettingToggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [isOn, setIsOn] = useState(defaultOn)

  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <span className="text-xs text-kol-text-secondary font-body">{label}</span>
      <motion.button
        onClick={() => setIsOn(!isOn)}
        className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 ${
          isOn ? 'bg-kol-blue' : 'bg-kol-border/60'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow when active */}
        {isOn && (
          <div className="absolute inset-0 rounded-full bg-kol-blue/50 blur-md -z-10" />
        )}
        <motion.div
          className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: isOn ? '22px' : '3px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  )
}
