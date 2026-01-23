import { useState } from 'react'
import { motion } from 'framer-motion'

interface TradeTabProps {
  onTrade: (data: { address: string; amount: number; action: 'buy' | 'sell'; slippage: number }) => void
  isTrading?: boolean
  balance?: number
}

export function TradeTab({ onTrade, isTrading = false, balance = 0 }: TradeTabProps) {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const [slippage, setSlippage] = useState(20)
  const [showSettings, setShowSettings] = useState(false)

  const presetAmounts = [0.1, 0.5, 1, 2]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !amount) return
    onTrade({
      address,
      amount: parseFloat(amount),
      action,
      slippage,
    })
  }

  const isValid = address.length > 30 && parseFloat(amount) > 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Token Address */}
        <div>
          <label className="text-[9px] text-kol-text-muted uppercase tracking-wide mb-1 block">
            Token Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter CA or paste from clipboard"
              className="w-full h-9 px-3 bg-kol-surface-elevated/50 border border-kol-border/50 rounded-lg text-xs text-kol-text placeholder:text-kol-text-muted focus:border-kol-blue/50 transition-colors font-mono"
            />
            <button
              type="button"
              onClick={async () => {
                const text = await navigator.clipboard.readText()
                setAddress(text)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-kol-text-muted hover:text-kol-text transition-colors"
            >
              <i className="ri-clipboard-line text-sm" />
            </button>
          </div>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="flex p-0.5 bg-kol-surface-elevated/50 rounded-full border border-kol-border/30">
          {(['buy', 'sell'] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAction(a)}
              className={`flex-1 py-1.5 rounded-full text-xs font-display font-medium transition-all ${
                action === a
                  ? a === 'buy'
                    ? 'bg-kol-green text-white shadow-sm'
                    : 'bg-kol-red text-white shadow-sm'
                  : 'text-kol-text-muted hover:text-kol-text-tertiary'
              }`}
            >
              {a === 'buy' ? (
                <span className="flex items-center justify-center gap-1">
                  <i className="ri-arrow-up-line" />
                  Buy
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <i className="ri-arrow-down-line" />
                  Sell
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] text-kol-text-muted uppercase tracking-wide">
              Amount
            </label>
            <span className="text-[9px] text-kol-text-muted">
              Balance: <span className="text-kol-text-tertiary font-mono">{balance.toFixed(3)} SOL</span>
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full h-10 pl-3 pr-14 bg-kol-surface-elevated/50 border border-kol-border/50 rounded-lg text-sm text-kol-text placeholder:text-kol-text-muted focus:border-kol-blue/50 transition-colors font-mono"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195]" />
              <span className="text-[10px] text-kol-text-muted">SOL</span>
            </div>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-1.5 mt-2">
            {presetAmounts.map((preset) => (
              <motion.button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className={`flex-1 py-1 rounded text-[10px] font-mono border transition-colors ${
                  amount === preset.toString()
                    ? 'bg-kol-blue/20 border-kol-blue/50 text-kol-blue'
                    : 'border-kol-border/30 text-kol-text-muted hover:border-kol-border/50 hover:text-kol-text-tertiary'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {preset}
              </motion.button>
            ))}
            <motion.button
              type="button"
              onClick={() => setAmount(balance.toString())}
              className="flex-1 py-1 rounded text-[10px] font-display border border-kol-border/30 text-kol-text-muted hover:border-kol-border/50 hover:text-kol-text-tertiary transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              MAX
            </motion.button>
          </div>
        </div>

        {/* Settings Toggle */}
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 text-[10px] text-kol-text-tertiary hover:text-kol-text-secondary transition-colors"
        >
          <i className="ri-settings-3-line" />
          Settings
          <i className={`ri-arrow-${showSettings ? 'up' : 'down'}-s-line`} />
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            className="p-2.5 bg-kol-surface-elevated/30 rounded-lg border border-kol-border/20 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[9px] text-kol-text-muted">Slippage</label>
                <span className="text-[10px] font-mono text-kol-text-secondary">{slippage}%</span>
              </div>
              <div className="flex gap-1">
                {[10, 15, 20, 30].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlippage(s)}
                    className={`flex-1 py-1 rounded text-[9px] font-mono transition-colors ${
                      slippage === s
                        ? 'bg-kol-blue/20 text-kol-blue border border-kol-blue/30'
                        : 'text-kol-text-muted border border-kol-border/20 hover:border-kol-border/40'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px]">
              <span className="text-kol-text-muted">Priority Fee</span>
              <span className="text-kol-text-secondary font-mono">Auto (0.0001 SOL)</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Trade Button */}
      <div className="px-3 py-2 border-t border-kol-border/30">
        <motion.button
          type="submit"
          disabled={!isValid || isTrading}
          className={`w-full h-10 rounded-full font-display font-semibold text-sm transition-all ${
            isValid && !isTrading
              ? action === 'buy'
                ? 'bg-gradient-to-r from-kol-green to-emerald-500 text-white shadow-lg shadow-kol-green/20'
                : 'bg-gradient-to-r from-kol-red to-rose-500 text-white shadow-lg shadow-kol-red/20'
              : 'bg-kol-surface-elevated text-kol-text-muted cursor-not-allowed'
          }`}
          whileHover={isValid && !isTrading ? { scale: 1.01 } : {}}
          whileTap={isValid && !isTrading ? { scale: 0.99 } : {}}
        >
          {isTrading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <i className={action === 'buy' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />
              {action === 'buy' ? 'Buy' : 'Sell'} {amount || '0'} SOL
            </span>
          )}
        </motion.button>
      </div>
    </form>
  )
}
