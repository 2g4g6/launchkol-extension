import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  onSignOut: () => void
  balance: number
  userEmail: string
}

// Search input (visual placeholder)
function SearchInput() {
  return (
    <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kol-surface/50 border border-kol-border/30 hover:border-kol-border/50 transition-colors cursor-pointer group min-w-[120px]">
      <i className="ri-search-line text-sm text-kol-text-muted group-hover:text-kol-text-secondary transition-colors" />
      <span className="text-xs text-kol-text-muted group-hover:text-kol-text-secondary transition-colors font-body flex-1">
        Search...
      </span>
      {/* Keyboard shortcut badge */}
      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-kol-border/40 text-kol-text-muted border border-kol-border/30">
        /
      </span>
    </div>
  )
}

// Wallet Balance indicator with Solana icon
function WalletIndicator({ balance }: { balance: number }) {
  return (
    <motion.div
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kol-surface/50 border border-kol-border/30 hover:border-kol-blue/30 transition-all cursor-pointer group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-lg bg-kol-blue/0 group-hover:bg-kol-blue/5 transition-colors" />

      {/* Wallet icon */}
      <i className="ri-wallet-3-line text-sm text-kol-text-muted relative z-10" />

      {/* Official Solana Logo */}
      <svg width="14" height="11" viewBox="0 0 397 311" fill="none" className="relative z-10">
        <defs>
          <linearGradient id="solanaGradA" x1="360.879" y1="351.455" x2="141.213" y2="-69.2936" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3"/>
            <stop offset="1" stopColor="#DC1FFF"/>
          </linearGradient>
          <linearGradient id="solanaGradB" x1="264.829" y1="401.601" x2="45.163" y2="-19.1475" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3"/>
            <stop offset="1" stopColor="#DC1FFF"/>
          </linearGradient>
          <linearGradient id="solanaGradC" x1="312.548" y1="376.688" x2="92.8822" y2="-44.061" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3"/>
            <stop offset="1" stopColor="#DC1FFF"/>
          </linearGradient>
        </defs>
        <path d="M64.6 237.9C67.1 235.4 70.5 234 74.1 234H389.8C395.9 234 398.9 241.4 394.6 245.7L332.4 307.9C329.9 310.4 326.5 311.8 322.9 311.8H7.2C1.1 311.8 -1.9 304.4 2.4 300.1L64.6 237.9Z" fill="url(#solanaGradA)"/>
        <path d="M64.6 3.9C67.2 1.4 70.6 0 74.1 0H389.8C395.9 0 398.9 7.4 394.6 11.7L332.4 73.9C329.9 76.4 326.5 77.8 322.9 77.8H7.2C1.1 77.8 -1.9 70.4 2.4 66.1L64.6 3.9Z" fill="url(#solanaGradB)"/>
        <path d="M332.4 120.6C329.9 118.1 326.5 116.7 322.9 116.7H7.2C1.1 116.7 -1.9 124.1 2.4 128.4L64.6 190.6C67.1 193.1 70.5 194.5 74.1 194.5H389.8C395.9 194.5 398.9 187.1 394.6 182.8L332.4 120.6Z" fill="url(#solanaGradC)"/>
      </svg>

      <span className="relative z-10 text-sm font-mono text-white font-medium">
        {balance.toFixed(2)}
      </span>
    </motion.div>
  )
}

// User dropdown with avatar
function UserDropdown({
  email,
  onSignOut,
}: {
  email: string
  onSignOut: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get initials from email
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-full bg-gradient-to-br from-kol-blue/30 to-kol-blue/10 border border-kol-border/40 hover:border-kol-blue/40 flex items-center justify-center transition-all overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Avatar glow */}
        <div className="absolute inset-0 bg-kol-blue/0 group-hover:bg-kol-blue/10 transition-colors" />

        {/* Initials */}
        <span className="text-[10px] font-bold text-white relative z-10">{initials}</span>

        {/* Online status dot */}
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-kol-green border-2 border-kol-bg z-20"
          style={{ boxShadow: '0 0 6px rgba(0, 196, 107, 0.6)' }}
        />
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-48 bg-kol-surface-elevated/95 backdrop-blur-xl border border-kol-border/50 rounded-xl overflow-hidden z-50"
            style={{
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03) inset',
            }}
          >
            {/* Subtle glow */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-kol-blue/10 blur-2xl pointer-events-none" />

            {/* User info */}
            <div className="relative px-3 py-2.5 border-b border-kol-border/30">
              <p className="text-[10px] text-kol-text-muted uppercase tracking-wider mb-0.5 font-medium">Signed in as</p>
              <p className="text-xs text-white font-body truncate">{email}</p>
            </div>

            {/* Menu items */}
            <div className="relative py-1">
              <DropdownItem icon="ri-user-3-line" label="Profile" onClick={() => setIsOpen(false)} />
              <DropdownItem icon="ri-settings-3-line" label="Settings" onClick={() => setIsOpen(false)} />
            </div>

            {/* Divider */}
            <div className="h-px bg-kol-border/30 mx-2" />

            {/* Sign out */}
            <div className="relative py-1">
              <DropdownItem
                icon="ri-logout-box-line"
                label="Sign Out"
                onClick={() => { setIsOpen(false); onSignOut() }}
                variant="danger"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Dropdown menu item
function DropdownItem({
  icon,
  label,
  onClick,
  variant = 'default'
}: {
  icon: string
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}) {
  const colorClass = variant === 'danger'
    ? 'text-kol-red hover:bg-kol-red/10'
    : 'text-kol-text-secondary hover:text-white hover:bg-kol-surface/80'

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-body transition-colors ${colorClass}`}
    >
      <i className={`${icon} text-sm`} />
      <span>{label}</span>
    </button>
  )
}

export function Header({
  activeTab,
  onTabChange,
  onSignOut,
  balance,
  userEmail,
}: HeaderProps) {
  return (
    <motion.header
      className="relative flex items-center justify-between px-4 py-3 bg-transparent z-20"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glass-morphism background */}
      <div className="absolute inset-0 bg-kol-bg/70 backdrop-blur-xl border-b border-kol-border/30" />

      {/* Bottom edge glow line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 123, 255, 0.25) 50%, transparent 100%)',
        }}
      />

      {/* Left side: Logo + Tabs */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Logo */}
        <Logo size="sm" showText={true} animated={false} />

        {/* Tab Navigation - clean text style */}
        <nav className="flex items-center gap-1">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-1.5 px-3 py-1.5"
              whileTap={{ scale: 0.97 }}
            >
              {/* Active underline indicator */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-kol-blue"
                  style={{
                    boxShadow: '0 0 8px rgba(0, 123, 255, 0.5)',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}

              <i className={`${tab.icon} text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-kol-text-muted'
              }`} />

              <span className={`text-sm font-semibold transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-kol-text-muted hover:text-kol-text-secondary'
              }`}>
                {tab.label}
              </span>

              {/* Live indicator for Feed */}
              {tab.id === 'feed' && (
                <span className="w-2 h-2 rounded-full bg-kol-red shadow-sm shadow-kol-red/50 animate-pulse" />
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Right side: Search, Wallet, User */}
      <div className="relative z-10 flex items-center gap-2">
        <SearchInput />
        <WalletIndicator balance={balance} />
        <UserDropdown email={userEmail} onSignOut={onSignOut} />
      </div>
    </motion.header>
  )
}
