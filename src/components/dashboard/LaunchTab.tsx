import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface LaunchFormData {
  name: string
  symbol: string
  description: string
  image: File | null
  imagePreview: string | null
  twitter: string
  telegram: string
  website: string
}

interface LaunchTabProps {
  onLaunch: (data: LaunchFormData) => void
  isLaunching?: boolean
}

export function LaunchTab({ onLaunch, isLaunching = false }: LaunchTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<LaunchFormData>({
    name: '',
    symbol: '',
    description: '',
    image: null,
    imagePreview: null,
    twitter: '',
    telegram: '',
    website: '',
  })
  const [showSocials, setShowSocials] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setForm(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.symbol) return
    onLaunch(form)
  }

  const isValid = form.name.length > 0 && form.symbol.length > 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Image Upload */}
        <div className="flex gap-3">
          <motion.div
            className="relative w-16 h-16 rounded-lg border border-dashed border-kol-border hover:border-kol-blue/50 bg-kol-surface-elevated/30 flex items-center justify-center cursor-pointer overflow-hidden transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
          >
            {form.imagePreview ? (
              <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <i className="ri-image-add-line text-lg text-kol-text-muted" />
                <p className="text-[8px] text-kol-text-muted mt-0.5">Image</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </motion.div>

          {/* Name and Symbol */}
          <div className="flex-1 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Token Name"
                maxLength={32}
                className="w-full h-8 px-2.5 bg-kol-surface-elevated/50 border border-kol-border/50 rounded-lg text-xs text-kol-text placeholder:text-kol-text-muted focus:border-kol-blue/50 transition-colors"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-kol-text-muted">
                {form.name.length}/32
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-kol-text-muted">$</span>
              <input
                type="text"
                value={form.symbol}
                onChange={(e) => setForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                placeholder="TICKER"
                maxLength={10}
                className="w-full h-8 pl-5 pr-2.5 bg-kol-surface-elevated/50 border border-kol-border/50 rounded-lg text-xs text-kol-text placeholder:text-kol-text-muted focus:border-kol-blue/50 transition-colors font-mono"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-kol-text-muted">
                {form.symbol.length}/10
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="relative">
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Token description (optional)"
            maxLength={256}
            rows={2}
            className="w-full px-2.5 py-2 bg-kol-surface-elevated/50 border border-kol-border/50 rounded-lg text-xs text-kol-text placeholder:text-kol-text-muted focus:border-kol-blue/50 transition-colors resize-none"
          />
          <span className="absolute right-2 bottom-1.5 text-[9px] text-kol-text-muted">
            {form.description.length}/256
          </span>
        </div>

        {/* Social Links Toggle */}
        <button
          type="button"
          onClick={() => setShowSocials(!showSocials)}
          className="flex items-center gap-1.5 text-[10px] text-kol-text-tertiary hover:text-kol-text-secondary transition-colors"
        >
          <i className={`ri-arrow-${showSocials ? 'up' : 'down'}-s-line`} />
          Social links (optional)
        </button>

        {/* Social Links */}
        {showSocials && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="relative">
              <i className="ri-twitter-x-line absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-kol-text-muted" />
              <input
                type="text"
                value={form.twitter}
                onChange={(e) => setForm(prev => ({ ...prev, twitter: e.target.value }))}
                placeholder="Twitter URL"
                className="w-full h-7 pl-7 pr-2.5 bg-kol-surface-elevated/30 border border-kol-border/30 rounded text-[11px] text-kol-text placeholder:text-kol-text-muted focus:border-kol-blue/50 transition-colors"
              />
            </div>
            <div className="relative">
              <i className="ri-telegram-line absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-kol-text-muted" />
              <input
                type="text"
                value={form.telegram}
                onChange={(e) => setForm(prev => ({ ...prev, telegram: e.target.value }))}
                placeholder="Telegram URL"
                className="w-full h-7 pl-7 pr-2.5 bg-kol-surface-elevated/30 border border-kol-border/30 rounded text-[11px] text-kol-text placeholder:text-kol-text-muted focus:border-kol-blue/50 transition-colors"
              />
            </div>
            <div className="relative">
              <i className="ri-global-line absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-kol-text-muted" />
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
                placeholder="Website URL"
                className="w-full h-7 pl-7 pr-2.5 bg-kol-surface-elevated/30 border border-kol-border/30 rounded text-[11px] text-kol-text placeholder:text-kol-text-muted focus:border-kol-blue/50 transition-colors"
              />
            </div>
          </motion.div>
        )}

        {/* Platform Selection */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-kol-text-muted">Platform:</span>
          <div className="flex gap-1">
            <button
              type="button"
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-kol-blue/20 text-kol-blue border border-kol-blue/30"
            >
              pump.fun
            </button>
            <button
              type="button"
              className="px-2 py-0.5 rounded-full text-[10px] font-medium text-kol-text-muted border border-kol-border/30 hover:border-kol-border/50 transition-colors"
            >
              bonk.fun
            </button>
          </div>
        </div>
      </div>

      {/* Launch Button */}
      <div className="px-3 py-2 border-t border-kol-border/30">
        <motion.button
          type="submit"
          disabled={!isValid || isLaunching}
          className={`w-full h-9 rounded-full font-display font-semibold text-xs transition-all ${
            isValid && !isLaunching
              ? 'bg-gradient-to-r from-kol-blue to-kol-blue-hover text-white shadow-lg shadow-kol-blue/20'
              : 'bg-kol-surface-elevated text-kol-text-muted cursor-not-allowed'
          }`}
          whileHover={isValid && !isLaunching ? { scale: 1.01 } : {}}
          whileTap={isValid && !isLaunching ? { scale: 0.99 } : {}}
        >
          {isLaunching ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Launching...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <i className="ri-rocket-line" />
              Launch Token
            </span>
          )}
        </motion.button>
        <p className="text-[9px] text-kol-text-muted text-center mt-1.5">
          Fee: 0.02 SOL + Platform fees
        </p>
      </div>
    </form>
  )
}
