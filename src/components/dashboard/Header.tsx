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
  notificationCount?: number
}

// Compact search input (visual placeholder)
function SearchInput() {
  return (
    <div className="relative flex items-center gap-1.5 px-2 py-1 rounded-lg bg-kol-surface/50 border border-kol-border/30 hover:border-kol-border/50 transition-colors cursor-pointer group">
      <i className="ri-search-line text-[10px] text-kol-text-muted group-hover:text-kol-text-secondary transition-colors" />
      <span className="text-[10px] text-kol-text-muted group-hover:text-kol-text-secondary transition-colors font-body">
        Search
      </span>
      {/* Keyboard shortcut badge */}
      <span className="ml-1 px-1 py-0.5 rounded text-[8px] font-mono bg-kol-border/40 text-kol-text-muted border border-kol-border/30">
        /
      </span>
    </div>
  )
}

// SOL Balance indicator
function BalanceIndicator({ balance }: { balance: number }) {
  return (
    <motion.div
      className="relative flex items-center gap-1.5 px-2 py-1 rounded-lg bg-kol-surface/50 border border-kol-border/30 hover:border-kol-blue/30 transition-all cursor-pointer group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Subtle blue glow on hover */}
      <div className="absolute inset-0 rounded-lg bg-kol-blue/0 group-hover:bg-kol-blue/5 transition-colors" />

      {/* SOL Diamond icon */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="relative z-10">
        <path
          d="M12 2L22 12L12 22L2 12L12 2Z"
          fill="url(#solGrad)"
          stroke="url(#solStroke)"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="solGrad" x1="2" y1="2" x2="22" y2="22">
            <stop stopColor="#9945FF" />
            <stop offset="0.5" stopColor="#14F195" />
            <stop offset="1" stopColor="#00C2FF" />
          </linearGradient>
          <linearGradient id="solStroke" x1="2" y1="2" x2="22" y2="22">
            <stop stopColor="#9945FF" stopOpacity="0.5" />
            <stop offset="1" stopColor="#14F195" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>

      <span className="relative z-10 text-[11px] font-mono text-white font-medium">
        {balance.toFixed(2)}
      </span>
    </motion.div>
  )
}

// Notification bell with badge
function NotificationBell({ count = 0 }: { count?: number }) {
  return (
    <motion.button
      className="relative w-7 h-7 rounded-lg bg-kol-surface/50 border border-kol-border/30 hover:border-kol-border/50 flex items-center justify-center transition-all group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-0 rounded-lg bg-kol-blue/0 group-hover:bg-kol-blue/5 transition-colors" />
      <i className="ri-notification-3-line text-[13px] text-kol-text-muted group-hover:text-white transition-colors relative z-10" />

      {/* Badge */}
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-kol-red text-[8px] font-bold text-white flex items-center justify-center z-20"
          style={{
            boxShadow: '0 0 8px rgba(255, 77, 79, 0.5)',
          }}
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </motion.button>
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
        className="relative w-7 h-7 rounded-full bg-gradient-to-br from-kol-blue/30 to-kol-blue/10 border border-kol-border/40 hover:border-kol-blue/40 flex items-center justify-center transition-all overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Avatar glow */}
        <div className="absolute inset-0 bg-kol-blue/0 group-hover:bg-kol-blue/10 transition-colors" />

        {/* Initials */}
        <span className="text-[9px] font-bold text-white relative z-10">{initials}</span>

        {/* Online status dot */}
        <span
          className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-kol-green border-2 border-kol-bg z-20"
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
  notificationCount = 0
}: HeaderProps) {
  return (
    <motion.header
      className="relative flex items-center justify-between px-3 py-2 bg-transparent z-20"
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
      <div className="relative z-10 flex items-center gap-2">
        {/* Compact Logo */}
        <Logo size="sm" showText={true} animated={false} />

        {/* Tab Navigation - inline */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-kol-surface/30 border border-kol-border/20">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-kol-text-muted hover:text-kol-text-secondary'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeHeaderTab"
                  className="absolute inset-0 bg-kol-surface-elevated/70 border border-kol-border/30 rounded-md"
                  style={{
                    boxShadow: '0 0 10px rgba(0, 123, 255, 0.12)',
                  }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <i className={`${tab.icon} text-[10px] relative z-10`} />
              <span className="relative z-10">{tab.label}</span>
              {tab.id === 'feed' && (
                <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-kol-red shadow-sm shadow-kol-red/50 animate-pulse" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Right side: Search, Balance, Notifications, User */}
      <div className="relative z-10 flex items-center gap-1.5">
        <SearchInput />
        <BalanceIndicator balance={balance} />
        <NotificationBell count={notificationCount} />
        <UserDropdown email={userEmail} onSignOut={onSignOut} />
      </div>
    </motion.header>
  )
}
