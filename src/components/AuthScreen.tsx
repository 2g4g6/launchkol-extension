import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from './Logo'

type AuthMode = 'signup' | 'login'
type AuthStep = 'credentials' | 'password' | 'otp' | 'recovery'

interface AuthScreenProps {
  onAuthSuccess?: (user: { email: string }) => void
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('signup')
  const [step, setStep] = useState<AuthStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password validation
  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)
  const doPasswordsMatch = password === confirmPassword && password.length > 0

  const handleCredentialsSubmit = async () => {
    if (!email.trim()) return
    setError(null)
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsLoading(false)

    if (mode === 'signup') {
      setStep('password')
    } else {
      if (!password.trim()) return
      // For login, go to OTP verification
      setStep('otp')
    }
  }

  const handlePasswordSubmit = async () => {
    if (!isPasswordValid || !doPasswordsMatch) return
    setError(null)
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))
    setIsLoading(false)

    // Show recovery key after signup
    setStep('recovery')
  }

  const handleOtpSubmit = async () => {
    const code = otp.join('')
    if (code.length !== 6) return
    setError(null)
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsLoading(false)

    onAuthSuccess?.({ email })
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }

    // Auto-submit when complete
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      setTimeout(() => handleOtpSubmit(), 300)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSocialAuth = (provider: 'google' | 'phantom') => {
    console.log(`Authenticating with ${provider}`)
    // Implement social auth
  }

  const switchMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup')
    setStep('credentials')
    setError(null)
    setPassword('')
    setConfirmPassword('')
    setOtp(['', '', '', '', '', ''])
  }

  const goBack = () => {
    if (step === 'password') {
      setStep('credentials')
    } else if (step === 'otp') {
      setStep('credentials')
    }
    setError(null)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050508] font-auth-body">

      {/* Premium layered background */}
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
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#007bff" stopOpacity="0" />
              <stop offset="50%" stopColor="#007bff" stopOpacity="1" />
              <stop offset="100%" stopColor="#007bff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="100%" x2="40%" y2="0" stroke="url(#lineGrad)" strokeWidth="1" />
          <line x1="60%" y1="100%" x2="100%" y2="30%" stroke="url(#lineGrad)" strokeWidth="1" />
        </svg>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${10 + (i * 7) % 80}%`,
                top: `${15 + (i * 11) % 70}%`,
                background: i % 3 === 0 ? 'rgba(0, 123, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)',
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + (i % 3) * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
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

        {/* Top edge glow - draws eye to logo */}
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

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full px-6 py-6">
        {/* Logo header */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Logo size="md" animated />
        </motion.div>

        {/* Auth card */}
        <motion.div
          className="flex-1 flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait" custom={step === 'credentials' ? -1 : 1}>
            {step === 'credentials' && (
              <motion.div
                key="credentials"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                className="flex-1 flex flex-col"
              >
                {/* Title */}
                <motion.div
                  variants={itemVariants}
                  className="text-center mb-6"
                >
                  <h1 className="font-auth-display text-2xl font-semibold text-white mb-1">
                    {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                  </h1>
                  <p className="font-auth-body text-sm text-kol-text-tertiary">
                    {mode === 'signup'
                      ? 'Join the most advanced Solana launchpad'
                      : 'Sign in to continue trading'}
                  </p>
                </motion.div>

                {/* Form */}
                <motion.div variants={itemVariants} className="space-y-3">
                  {/* Email input */}
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-kol-blue/20 to-kol-green/10 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
                    <div className="relative">
                      <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-kol-text-muted text-lg group-focus-within:text-kol-blue transition-colors" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-kol-surface-elevated/50 border border-kol-border rounded-xl text-white placeholder:text-kol-text-muted font-auth-body text-sm focus:border-kol-blue focus:bg-kol-surface-elevated transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Password input (login only) */}
                  {mode === 'login' && (
                    <div className="relative group">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-kol-blue/20 to-kol-green/10 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
                      <div className="relative">
                        <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-kol-text-muted text-lg group-focus-within:text-kol-blue transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-12 pl-11 pr-12 bg-kol-surface-elevated/50 border border-kol-border rounded-xl text-white placeholder:text-kol-text-muted font-auth-body text-sm focus:border-kol-blue focus:bg-kol-surface-elevated transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-kol-text-muted hover:text-white transition-colors"
                        >
                          <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Invite code (signup only) */}
                  {mode === 'signup' && (
                    <div className="relative group">
                      <div className="relative">
                        <i className="ri-gift-line absolute left-4 top-1/2 -translate-y-1/2 text-kol-text-muted text-lg group-focus-within:text-kol-blue transition-colors" />
                        <input
                          type="text"
                          placeholder="Invite code (optional)"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          className="w-full h-12 pl-11 pr-4 bg-kol-surface-elevated/50 border border-kol-border rounded-xl text-white placeholder:text-kol-text-muted font-auth-body text-sm focus:border-kol-blue focus:bg-kol-surface-elevated transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-kol-red/10 border border-kol-red/20">
                        <i className="ri-error-warning-line text-kol-red" />
                        <span className="text-kol-red text-sm">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.div variants={itemVariants} className="mt-4">
                  <button
                    onClick={handleCredentialsSubmit}
                    disabled={isLoading || !email.trim() || (mode === 'login' && !password.trim())}
                    className="relative w-full h-12 rounded-xl font-auth-display font-semibold text-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Button gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-kol-blue to-kol-blue-hover transition-all duration-300 group-hover:scale-105" />
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />
                    </div>
                    {/* Button content */}
                    <span className="relative z-10 flex items-center justify-center gap-2 text-kol-bg">
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <i className="ri-loader-4-line text-lg" />
                        </motion.div>
                      ) : (
                        <>
                          {mode === 'signup' ? 'Continue' : 'Sign In'}
                          <i className="ri-arrow-right-line text-lg" />
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-kol-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-kol-bg text-kol-text-muted text-xs font-auth-body">
                      or continue with
                    </span>
                  </div>
                </motion.div>

                {/* Social auth buttons */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialAuth('google')}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl bg-kol-surface-elevated/50 border border-kol-border hover:border-kol-border-hover hover:bg-kol-surface-elevated transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-auth-body text-kol-text-secondary group-hover:text-white transition-colors">Google</span>
                  </button>

                  <button
                    onClick={() => handleSocialAuth('phantom')}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl bg-kol-surface-elevated/50 border border-kol-border hover:border-kol-border-hover hover:bg-kol-surface-elevated transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 128 128" fill="none">
                      <rect width="128" height="128" rx="26.8" fill="url(#phantom-gradient)"/>
                      <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3057 14.4118 64.0583C13.936 87.5709 35.1238 107 58.9462 107H63.0334C83.9845 107 110.584 89.0278 110.584 64.9142Z" fill="url(#phantom-gradient2)"/>
                      <path d="M77.8031 63.4286C77.8031 67.4034 74.5723 70.6251 70.5859 70.6251C66.5995 70.6251 63.3687 67.4034 63.3687 63.4286C63.3687 59.4538 66.5995 56.232 70.5859 56.232C74.5723 56.232 77.8031 59.4538 77.8031 63.4286Z" fill="#fff"/>
                      <path d="M50.9697 63.4286C50.9697 67.4034 47.7389 70.6251 43.7525 70.6251C39.7661 70.6251 36.5353 67.4034 36.5353 63.4286C36.5353 59.4538 39.7661 56.232 43.7525 56.232C47.7389 56.232 50.9697 59.4538 50.9697 63.4286Z" fill="#fff"/>
                      <defs>
                        <linearGradient id="phantom-gradient" x1="64" y1="0" x2="64" y2="128" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#534BB1"/>
                          <stop offset="1" stopColor="#551BF9"/>
                        </linearGradient>
                        <linearGradient id="phantom-gradient2" x1="62.4982" y1="23" x2="62.4982" y2="107" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#fff"/>
                          <stop offset="1" stopColor="#fff" stopOpacity="0.82"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-sm font-auth-body text-kol-text-secondary group-hover:text-white transition-colors">Phantom</span>
                  </button>
                </motion.div>

                {/* Switch mode link */}
                <motion.div variants={itemVariants} className="mt-auto pt-4 text-center">
                  <span className="text-kol-text-muted text-sm font-auth-body">
                    {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                      onClick={switchMode}
                      className="text-kol-blue hover:text-kol-blue-hover font-medium transition-colors"
                    >
                      {mode === 'signup' ? 'Sign in' : 'Sign up'}
                    </button>
                  </span>
                </motion.div>
              </motion.div>
            )}

            {step === 'password' && (
              <motion.div
                key="password"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                className="flex-1 flex flex-col"
              >
                {/* Back button */}
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-kol-text-muted hover:text-white transition-colors mb-4 w-fit"
                >
                  <i className="ri-arrow-left-line" />
                  <span className="text-sm font-auth-body">Back</span>
                </button>

                {/* Title */}
                <div className="text-center mb-6">
                  <h1 className="font-auth-display text-2xl font-semibold text-white mb-1">
                    Create Password
                  </h1>
                  <p className="font-auth-body text-sm text-kol-text-tertiary">
                    Secure your account with a strong password
                  </p>
                </div>

                {/* Password inputs */}
                <div className="space-y-3">
                  <div className="relative group">
                    <div className="relative">
                      <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-kol-text-muted text-lg group-focus-within:text-kol-blue transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 pl-11 pr-12 bg-kol-surface-elevated/50 border border-kol-border rounded-xl text-white placeholder:text-kol-text-muted font-auth-body text-sm focus:border-kol-blue focus:bg-kol-surface-elevated transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-kol-text-muted hover:text-white transition-colors"
                      >
                        <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="relative">
                      <i className="ri-lock-check-line absolute left-4 top-1/2 -translate-y-1/2 text-kol-text-muted text-lg group-focus-within:text-kol-blue transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-kol-surface-elevated/50 border border-kol-border rounded-xl text-white placeholder:text-kol-text-muted font-auth-body text-sm focus:border-kol-blue focus:bg-kol-surface-elevated transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Password requirements */}
                <div className="mt-4 p-3 rounded-xl bg-kol-surface/50 border border-kol-border">
                  <p className="text-xs text-kol-text-muted mb-2 font-auth-body">Password requirements:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'length', label: '8+ characters' },
                      { key: 'uppercase', label: 'Uppercase' },
                      { key: 'lowercase', label: 'Lowercase' },
                      { key: 'number', label: 'Number' },
                      { key: 'special', label: 'Special char' },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className={`flex items-center gap-1.5 text-xs font-auth-body transition-colors ${
                          passwordRequirements[key as keyof typeof passwordRequirements]
                            ? 'text-kol-green'
                            : 'text-kol-text-muted'
                        }`}
                      >
                        <i
                          className={
                            passwordRequirements[key as keyof typeof passwordRequirements]
                              ? 'ri-checkbox-circle-fill'
                              : 'ri-checkbox-blank-circle-line'
                          }
                        />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <div className={`mt-2 flex items-center gap-1.5 text-xs font-auth-body ${doPasswordsMatch ? 'text-kol-green' : 'text-kol-red'}`}>
                    <i className={doPasswordsMatch ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'} />
                    {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}

                {/* Submit button */}
                <div className="mt-auto pt-4">
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                    className="relative w-full h-12 rounded-xl font-auth-display font-semibold text-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-kol-blue to-kol-blue-hover transition-all duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />
                    </div>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-kol-bg">
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <i className="ri-loader-4-line text-lg" />
                        </motion.div>
                      ) : (
                        <>
                          Create Account
                          <i className="ri-arrow-right-line text-lg" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                className="flex-1 flex flex-col"
              >
                {/* Back button */}
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-kol-text-muted hover:text-white transition-colors mb-4 w-fit"
                >
                  <i className="ri-arrow-left-line" />
                  <span className="text-sm font-auth-body">Back</span>
                </button>

                {/* Title */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-kol-blue/10 border border-kol-blue/20 mb-4">
                    <i className="ri-mail-check-line text-3xl text-kol-blue" />
                  </div>
                  <h1 className="font-auth-display text-2xl font-semibold text-white mb-1">
                    Check Your Email
                  </h1>
                  <p className="font-auth-body text-sm text-kol-text-tertiary">
                    We sent a code to <span className="text-white">{email}</span>
                  </p>
                </div>

                {/* OTP inputs */}
                <div className="flex justify-center gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-14 text-center text-xl font-mono font-semibold bg-kol-surface-elevated/50 border border-kol-border rounded-xl text-white focus:border-kol-blue focus:bg-kol-surface-elevated transition-all duration-300"
                    />
                  ))}
                </div>

                {/* Resend code */}
                <div className="text-center mb-auto">
                  <span className="text-kol-text-muted text-sm font-auth-body">
                    Didn't receive the code?{' '}
                    <button className="text-kol-blue hover:text-kol-blue-hover font-medium transition-colors">
                      Resend
                    </button>
                  </span>
                </div>

                {/* Submit button */}
                <div className="mt-auto pt-4">
                  <button
                    onClick={handleOtpSubmit}
                    disabled={isLoading || otp.some(d => !d)}
                    className="relative w-full h-12 rounded-xl font-auth-display font-semibold text-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-kol-blue to-kol-blue-hover transition-all duration-300 group-hover:scale-105" />
                    <span className="relative z-10 flex items-center justify-center gap-2 text-kol-bg">
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <i className="ri-loader-4-line text-lg" />
                        </motion.div>
                      ) : (
                        <>
                          Verify Code
                          <i className="ri-arrow-right-line text-lg" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'recovery' && (
              <motion.div
                key="recovery"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                className="flex-1 flex flex-col"
              >
                {/* Title */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-kol-green/10 border border-kol-green/20 mb-4">
                    <i className="ri-key-2-line text-3xl text-kol-green" />
                  </div>
                  <h1 className="font-auth-display text-2xl font-semibold text-white mb-1">
                    Recovery Key
                  </h1>
                  <p className="font-auth-body text-sm text-kol-text-tertiary">
                    Save this key somewhere safe. You'll need it to recover your wallet.
                  </p>
                </div>

                {/* Recovery key display */}
                <div className="p-4 rounded-xl bg-kol-surface-elevated/50 border border-kol-border mb-4">
                  <div className="grid grid-cols-3 gap-2">
                    {['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'].map((word, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-sm font-mono">
                        <span className="text-kol-text-muted w-4">{i + 1}.</span>
                        <span className="text-white">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Copy button */}
                <button className="flex items-center justify-center gap-2 h-10 rounded-lg bg-kol-surface border border-kol-border hover:border-kol-border-hover transition-all duration-300 mb-4">
                  <i className="ri-file-copy-line text-kol-text-secondary" />
                  <span className="text-sm font-auth-body text-kol-text-secondary">Copy to clipboard</span>
                </button>

                {/* Warning */}
                <div className="flex gap-3 p-3 rounded-xl bg-kol-red/5 border border-kol-red/20 mb-auto">
                  <i className="ri-error-warning-line text-kol-red text-lg flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-kol-text-secondary font-auth-body leading-relaxed">
                    Never share your recovery key. Anyone with this key can access your wallet and funds.
                  </p>
                </div>

                {/* Continue button */}
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => onAuthSuccess?.({ email })}
                    className="relative w-full h-12 rounded-xl font-auth-display font-semibold text-sm overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-kol-green to-emerald-500 transition-all duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />
                    </div>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-kol-bg">
                      I've Saved My Key
                      <i className="ri-checkbox-circle-fill text-lg" />
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
