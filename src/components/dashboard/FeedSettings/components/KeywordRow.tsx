import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ColorPicker } from './ColorPicker'
import { SoundPicker } from './SoundPicker'
import { ToggleSwitch } from './ToggleSwitch'
import { Tooltip } from '../../../ui/Tooltip'
import type { Keyword } from '../types'
import { DEFAULT_FILTER_NOTIFICATION } from '../constants'

export interface KeywordRowProps {
  keyword: Keyword
  onChange: (updates: Partial<Keyword>) => void
  onDelete: () => void
  disabled?: boolean
  showAutoBuy?: boolean
}

export function KeywordRow({ keyword, onChange, onDelete, disabled, showAutoBuy }: KeywordRowProps) {
  const notification = keyword.notification ?? DEFAULT_FILTER_NOTIFICATION
  const autoBuy = keyword.autoBuy ?? { enabled: false, tokenAddress: '', buyAmount: '' }
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`
        rounded-lg bg-kol-surface/30 border border-kol-border/30
        transition-opacity
        ${!keyword.enabled ? 'opacity-50' : ''}
        ${disabled ? 'pointer-events-none opacity-40' : ''}
      `}
    >
      <div className="flex items-center gap-2 px-2 py-1.5 max-sm:px-3 max-sm:py-2.5">
        {/* Color picker */}
        <ColorPicker
          currentColor={keyword.color}
          onSelect={(color) => onChange({ color })}
        />

        {/* Keyword text */}
        <span
          className={`
            flex-1 text-xs max-sm:text-sm font-medium text-white truncate
            ${!keyword.enabled ? 'line-through text-kol-text-muted' : ''}
          `}
          style={{ color: keyword.enabled ? keyword.color : undefined }}
        >
          {keyword.text}
        </span>

        {/* Options */}
        <div className="flex items-center gap-1.5">
          {/* Case sensitive */}
          <Tooltip content="Match case exactly" position="top">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] max-sm:text-xs text-kol-text-muted">Aa</span>
              <ToggleSwitch
                enabled={keyword.caseSensitive}
                onChange={(v) => onChange({ caseSensitive: v })}
              />
            </div>
          </Tooltip>

          {/* Whole word */}
          <Tooltip content="Match whole words only" position="top">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] max-sm:text-xs text-kol-text-muted">[w]</span>
              <ToggleSwitch
                enabled={keyword.wholeWord}
                onChange={(v) => onChange({ wholeWord: v })}
              />
            </div>
          </Tooltip>

          {/* Desktop notification toggle */}
          <Tooltip content="Desktop notification" position="top">
            <button
              onClick={() => onChange({
                notification: { ...notification, desktop: !notification.desktop }
              })}
              className={`
                w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                ${notification.desktop
                  ? 'text-kol-blue bg-kol-blue/10'
                  : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                }
              `}
            >
              <i className={notification.desktop ? 'ri-notification-3-fill' : 'ri-notification-3-line'} />
            </button>
          </Tooltip>

          {/* Sound toggle */}
          <Tooltip content="Sound notification" position="top">
            <button
              onClick={() => onChange({
                notification: { ...notification, sound: !notification.sound }
              })}
              className={`
                w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                ${notification.sound
                  ? 'text-kol-blue bg-kol-blue/10'
                  : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                }
              `}
            >
              <i className={notification.sound ? 'ri-volume-up-fill' : 'ri-volume-mute-line'} />
            </button>
          </Tooltip>
          <SoundPicker
            currentSound={notification.soundId}
            onSelect={(soundId) => onChange({
              notification: { ...notification, soundId }
            })}
            enabled={notification.sound}
          />

          {/* Auto-buy expand toggle (account-level only) */}
          {showAutoBuy && (
            <Tooltip content={autoBuy.enabled ? 'Auto-buy enabled' : 'Auto-buy trigger'} position="top">
              <button
                onClick={() => setExpanded(!expanded)}
                className={`
                  w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                  ${autoBuy.enabled
                    ? 'text-kol-green bg-kol-green/10'
                    : 'text-kol-text-muted/40 hover:text-kol-text-muted'
                  }
                `}
              >
                <i className="ri-shopping-cart-2-line text-sm" />
              </button>
            </Tooltip>
          )}

          {/* Enabled toggle */}
          <Tooltip content={keyword.enabled ? 'Disable keyword' : 'Enable keyword'} position="top">
            <button
              onClick={() => onChange({ enabled: !keyword.enabled })}
              className={`
                w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center transition-colors
                ${keyword.enabled
                  ? 'text-kol-green hover:bg-kol-green/10'
                  : 'text-kol-text-muted hover:bg-kol-surface-elevated'
                }
              `}
            >
              <i className={`text-sm ${keyword.enabled ? 'ri-eye-line' : 'ri-eye-off-line'}`} />
            </button>
          </Tooltip>

          {/* Delete button */}
          <Tooltip content="Delete keyword" position="top">
            <button
              onClick={onDelete}
              className="w-6 h-6 max-sm:w-9 max-sm:h-9 rounded flex items-center justify-center text-kol-text-muted hover:text-kol-red hover:bg-kol-red/10 transition-colors"
            >
              <i className="ri-close-line text-sm" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Auto-buy expandable section */}
      {showAutoBuy && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="px-2 pb-2 max-sm:px-3 max-sm:pb-3 border-t border-kol-border/20 pt-2 space-y-2">
                {/* Enable auto-buy toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-kol-text-muted flex items-center gap-1.5">
                    <i className="ri-shopping-cart-2-line" />
                    Auto-buy on keyword trigger
                  </label>
                  <ToggleSwitch
                    enabled={autoBuy.enabled}
                    onChange={(v) => onChange({
                      autoBuy: { ...autoBuy, enabled: v }
                    })}
                  />
                </div>

                {/* Token address & buy amount (shown when auto-buy enabled) */}
                <AnimatePresence>
                  {autoBuy.enabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="overflow-hidden space-y-2"
                    >
                      <div>
                        <label className="block text-[10px] text-kol-text-muted mb-1">
                          Token Address
                        </label>
                        <input
                          type="text"
                          value={autoBuy.tokenAddress}
                          onChange={(e) => onChange({
                            autoBuy: { ...autoBuy, tokenAddress: e.target.value }
                          })}
                          placeholder="Enter token mint address..."
                          className="w-full px-2 py-1.5 rounded-md bg-kol-surface/50 border border-kol-border/50 text-xs text-white font-mono placeholder:text-kol-text-muted/40 outline-none focus:border-kol-blue/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-kol-text-muted mb-1">
                          Buy Amount (SOL)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={autoBuy.buyAmount}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === '' || /^\d*\.?\d*$/.test(val)) {
                              onChange({
                                autoBuy: { ...autoBuy, buyAmount: val }
                              })
                            }
                          }}
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 rounded-md bg-kol-surface/50 border border-kol-border/50 text-xs text-white font-mono placeholder:text-kol-text-muted/40 outline-none focus:border-kol-blue/50 transition-colors"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
