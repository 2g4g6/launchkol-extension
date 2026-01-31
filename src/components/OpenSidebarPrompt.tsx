import { motion } from 'framer-motion'
import { Logo } from './Logo'
import { User } from '../shared/hooks/useAuthState'

interface OpenSidebarPromptProps {
  user: User
}

export function OpenSidebarPrompt({ user }: OpenSidebarPromptProps) {
  const handleOpenSidebar = async () => {
    try {
      // Try to open the sidepanel via the background script
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
          if (response?.success) {
            // Close the popup after a brief delay
            setTimeout(() => window.close(), 100)
          }
        })
      }
    } catch (error) {
      console.error('Failed to open sidebar:', error)
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050508]">
      {/* Premium background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050508] via-[#0a0f1a] to-[#050508]" />

        {/* Animated orbs */}
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, color-mix(in srgb, var(--kol-blue) 15%, transparent) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[250px] h-[250px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 196, 107, 0.1) 0%, transparent 70%)',
            bottom: '-80px',
            left: '-80px',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full px-6 py-8 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 flex justify-center"
          >
            <Logo size="lg" showText={true} animated={false} />
          </motion.div>

          {/* Success icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-kol-green/10 border border-kol-green/20 mb-5"
          >
            <i className="ri-checkbox-circle-fill text-3xl text-kol-green" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="font-body text-xl font-semibold text-white mb-2"
          >
            Welcome!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="font-body text-sm text-kol-text-tertiary mb-2"
          >
            Signed in as{' '}
            <span className="text-white font-medium">{user.email}</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="font-body text-xs text-kol-text-muted mb-8 max-w-[260px] mx-auto leading-relaxed"
          >
            Open the LaunchKOL sidebar to access your dashboard, trading tools, and more.
          </motion.p>

          {/* Open Sidebar Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            onClick={handleOpenSidebar}
            className="relative w-full h-12 rounded-xl font-body font-semibold text-sm overflow-hidden group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-kol-blue to-kol-blue-hover transition-all duration-300 group-hover:brightness-110" />
            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
              <i className="ri-layout-right-line text-lg" />
              Open Dashboard
            </span>
          </motion.button>

          {/* Hint text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="mt-4 text-[10px] text-kol-text-muted"
          >
            Or click the sidebar icon in your browser
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
