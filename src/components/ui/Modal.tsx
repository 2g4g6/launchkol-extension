import { useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Custom easing for smooth animations
const CUSTOM_EASE = [0.16, 1, 0.3, 1]

// Size presets for different modal use cases
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

const SIZE_MAP: Record<ModalSize, string> = {
  sm: 'w-[340px] max-h-[400px]',
  md: 'w-[420px] max-h-[500px]',
  lg: 'w-[520px] max-h-[600px]',
  xl: 'w-[640px] max-h-[700px]',
  full: 'w-[90vw] max-w-[800px] max-h-[85vh]',
}

// Filter tab types
export interface FilterTab {
  id: string
  label: string
  icon?: string
  badge?: string | number
  color?: string
}

// Sort option types
export interface SortOption {
  id: string
  label: string
  icon?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void

  // Header options
  title?: string
  subtitle?: string
  icon?: string
  showCloseButton?: boolean
  closeButtonStyle?: 'icon' | 'text'

  // Size
  size?: ModalSize

  // Search bar options
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  showEscHint?: boolean

  // Filter tabs (like Uxento/Axiom style)
  filterTabs?: FilterTab[]
  activeFilterId?: string
  onFilterChange?: (id: string) => void

  // Icon toolbar (like Uxento - clock, chart, diamond icons)
  toolbarIcons?: { icon: string; id: string; tooltip?: string; active?: boolean }[]
  onToolbarClick?: (id: string) => void

  // Sort options
  sortOptions?: SortOption[]
  activeSortId?: string
  onSortChange?: (id: string) => void
  showSortDropdown?: boolean

  // Toggle button (like "My Tokens" in Axiom)
  toggleLabel?: string
  toggleIcon?: string
  toggleActive?: boolean
  onToggleClick?: () => void

  // Section label (like "History" in RapidLaunch)
  sectionLabel?: string

  // Content
  children: ReactNode

  // Footer (optional)
  footer?: ReactNode

  // Animation options
  disableBackdropClick?: boolean
  disableEscapeKey?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  showCloseButton = true,
  closeButtonStyle = 'icon',
  size = 'md',
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showEscHint = false,
  filterTabs,
  activeFilterId,
  onFilterChange,
  toolbarIcons,
  onToolbarClick,
  sortOptions,
  activeSortId,
  onSortChange,
  showSortDropdown = false,
  toggleLabel,
  toggleIcon,
  toggleActive,
  onToggleClick,
  sectionLabel,
  children,
  footer,
  disableBackdropClick = false,
  disableEscapeKey = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Click outside to close
  useEffect(() => {
    if (disableBackdropClick) return

    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, disableBackdropClick])

  // Close on escape
  useEffect(() => {
    if (disableEscapeKey) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, disableEscapeKey])

  const hasHeader = title || subtitle || icon || showCloseButton
  const hasToolbar = filterTabs || toolbarIcons || sortOptions || toggleLabel
  const hasTopSection = showSearch || hasToolbar

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${SIZE_MAP[size]} bg-kol-surface-elevated/95 backdrop-blur-xl border border-kol-border/60 rounded-2xl overflow-hidden z-50 flex flex-col`}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: CUSTOM_EASE }}
          >
            {/* Header */}
            {hasHeader && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-kol-border/40">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="w-9 h-9 rounded-xl bg-kol-blue/10 border border-kol-blue/20 flex items-center justify-center">
                      <i className={`${icon} text-kol-blue text-lg`} />
                    </div>
                  )}
                  {(title || subtitle) && (
                    <div>
                      {title && (
                        <h2 className="font-body font-semibold text-white text-sm">{title}</h2>
                      )}
                      {subtitle && (
                        <p className="font-body text-xs text-kol-text-muted">{subtitle}</p>
                      )}
                    </div>
                  )}
                </div>

                {showCloseButton && (
                  closeButtonStyle === 'text' ? (
                    <button
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-lg text-kol-text-muted hover:text-white text-xs font-medium transition-colors"
                    >
                      Close
                    </button>
                  ) : (
                    <motion.button
                      onClick={onClose}
                      className="w-8 h-8 rounded-lg bg-kol-surface/50 border border-kol-border/30 flex items-center justify-center text-kol-text-muted hover:text-white hover:border-kol-border/50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="ri-close-line text-lg" />
                    </motion.button>
                  )
                )}
              </div>
            )}

            {/* Top Section: Search + Toolbar */}
            {hasTopSection && (
              <div className="px-4 py-3 border-b border-kol-border/30 space-y-3">
                {/* Search Bar */}
                {showSearch && (
                  <div className="relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-kol-text-muted text-sm" />
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full h-10 pl-9 pr-4 rounded-xl bg-kol-surface/60 border border-kol-border/40 text-sm text-white placeholder:text-kol-text-muted font-body focus:outline-none focus:border-kol-blue/50 transition-colors"
                    />
                    {showEscHint && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-kol-text-muted px-1.5 py-0.5 rounded bg-kol-surface/60 border border-kol-border/30">
                        Esc
                      </span>
                    )}
                  </div>
                )}

                {/* Toolbar Row */}
                {hasToolbar && (
                  <div className="flex items-center justify-between gap-3">
                    {/* Left side: Filter tabs or Toggle */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-none">
                      {/* Toggle Button */}
                      {toggleLabel && (
                        <motion.button
                          onClick={onToggleClick}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                            toggleActive
                              ? 'bg-kol-blue/15 border border-kol-blue/30 text-kol-blue'
                              : 'bg-kol-surface/50 border border-kol-border/30 text-kol-text-secondary hover:text-white hover:border-kol-border/50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {toggleIcon && <i className={`${toggleIcon} text-sm`} />}
                          {toggleLabel}
                        </motion.button>
                      )}

                      {/* Filter Tabs */}
                      {filterTabs && (
                        <div className="flex items-center gap-1.5">
                          {filterTabs.map((tab) => (
                            <motion.button
                              key={tab.id}
                              onClick={() => onFilterChange?.(tab.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                activeFilterId === tab.id
                                  ? 'bg-kol-blue/15 border border-kol-blue/30 text-white'
                                  : 'bg-kol-surface/50 border border-kol-border/30 text-kol-text-secondary hover:text-white hover:border-kol-border/50'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {tab.icon && (
                                <i
                                  className={`${tab.icon} text-sm`}
                                  style={tab.color ? { color: tab.color } : undefined}
                                />
                              )}
                              {tab.label}
                              {tab.badge && (
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-kol-surface text-[10px] text-kol-text-muted">
                                  {tab.badge}
                                </span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right side: Sort options or Toolbar icons */}
                    <div className="flex items-center gap-2">
                      {/* Sort Dropdown */}
                      {sortOptions && showSortDropdown && (
                        <select
                          value={activeSortId}
                          onChange={(e) => onSortChange?.(e.target.value)}
                          className="h-8 px-2 rounded-lg bg-kol-surface/50 border border-kol-border/30 text-xs text-kol-text-secondary font-body focus:outline-none focus:border-kol-blue/50 cursor-pointer"
                        >
                          {sortOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Sort Icons (inline) */}
                      {sortOptions && !showSortDropdown && (
                        <div className="flex items-center gap-1 px-1 py-0.5 rounded-lg bg-kol-surface/30 border border-kol-border/20">
                          {sortOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => onSortChange?.(opt.id)}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                                activeSortId === opt.id
                                  ? 'bg-kol-blue/15 text-kol-blue'
                                  : 'text-kol-text-muted hover:text-white hover:bg-kol-surface/50'
                              }`}
                              title={opt.label}
                            >
                              <i className={`${opt.icon || 'ri-sort-asc'} text-sm`} />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Toolbar Icons */}
                      {toolbarIcons && (
                        <div className="flex items-center gap-1 px-1 py-0.5 rounded-lg bg-kol-surface/30 border border-kol-border/20">
                          {toolbarIcons.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => onToolbarClick?.(item.id)}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                                item.active
                                  ? 'bg-kol-blue/15 text-kol-blue'
                                  : 'text-kol-text-muted hover:text-white hover:bg-kol-surface/50'
                              }`}
                              title={item.tooltip}
                            >
                              <i className={`${item.icon} text-sm`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section Label */}
            {sectionLabel && (
              <div className="px-4 py-2 border-b border-kol-border/20">
                <span className="text-[11px] font-medium text-kol-text-muted uppercase tracking-wider">
                  {sectionLabel}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-4 py-3 border-t border-kol-border/30">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================
// Pre-built Modal Content Components
// ============================================

// List item component (like coin rows in the modals)
interface ModalListItemProps {
  image?: string
  imageIcon?: string
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  stats?: { label: string; value: string; color?: string }[]
  actions?: { icon: string; onClick: () => void; tooltip?: string; variant?: 'default' | 'primary' | 'success' | 'danger' }[]
  onClick?: () => void
  socialIcons?: { icon: string; href?: string }[]
}

const BADGE_COLORS = {
  blue: 'bg-kol-blue/15 text-kol-blue border-kol-blue/30',
  green: 'bg-kol-green/15 text-kol-green border-kol-green/30',
  red: 'bg-kol-red/15 text-kol-red border-kol-red/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const ACTION_VARIANTS = {
  default: 'bg-kol-surface/50 border-kol-border/30 text-kol-text-secondary hover:text-white hover:border-kol-border/50',
  primary: 'bg-kol-blue/15 border-kol-blue/30 text-kol-blue hover:bg-kol-blue/25',
  success: 'bg-kol-green/15 border-kol-green/30 text-kol-green hover:bg-kol-green/25',
  danger: 'bg-kol-red/15 border-kol-red/30 text-kol-red hover:bg-kol-red/25',
}

export function ModalListItem({
  image,
  imageIcon,
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  stats,
  actions,
  onClick,
  socialIcons,
}: ModalListItemProps) {
  return (
    <motion.div
      className={`flex items-center gap-3 px-4 py-3 border-b border-kol-border/20 last:border-b-0 hover:bg-kol-surface/30 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { x: 2 } : undefined}
    >
      {/* Image or Icon */}
      {(image || imageIcon) && (
        <div className="relative flex-shrink-0">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-11 h-11 rounded-xl object-cover ring-1 ring-kol-border/40"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-kol-surface/60 border border-kol-border/40 flex items-center justify-center">
              <i className={`${imageIcon} text-lg text-kol-text-muted`} />
            </div>
          )}
          {badge && (
            <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-medium border ${BADGE_COLORS[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-body font-medium text-white text-sm truncate">
            {title}
          </span>
          {/* Social Icons */}
          {socialIcons && (
            <div className="flex items-center gap-1">
              {socialIcons.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-kol-text-muted hover:text-white transition-colors"
                >
                  <i className={`${social.icon} text-xs`} />
                </a>
              ))}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="font-body text-[11px] text-kol-text-muted truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-right">
              <span className="text-[10px] text-kol-text-muted">{stat.label}</span>
              <p
                className="font-mono text-xs font-medium"
                style={{ color: stat.color || '#fff' }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-1.5">
          {actions.map((action, idx) => (
            <motion.button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick()
              }}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                ACTION_VARIANTS[action.variant || 'default']
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={action.tooltip}
            >
              <i className={`${action.icon} text-sm`} />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Action button for modal footers
interface ModalActionButtonProps {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  icon?: string
  fullWidth?: boolean
  disabled?: boolean
}

const BUTTON_VARIANTS = {
  primary: 'bg-kol-blue text-white hover:bg-kol-blue-hover',
  secondary: 'bg-kol-surface/50 border border-kol-border/40 text-kol-text-secondary hover:text-white hover:border-kol-border/60',
  outline: 'bg-transparent border border-kol-blue/30 text-kol-blue hover:bg-kol-blue/10',
  danger: 'bg-kol-red/15 border border-kol-red/30 text-kol-red hover:bg-kol-red/25',
}

export function ModalActionButton({
  children,
  onClick,
  variant = 'primary',
  icon,
  fullWidth = false,
  disabled = false,
}: ModalActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-sm font-medium transition-colors ${
        BUTTON_VARIANTS[variant]
      } ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      {icon && <i className={`${icon} text-base`} />}
      {children}
    </motion.button>
  )
}

// Empty state for modal content
interface ModalEmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: string
  }
}

export function ModalEmptyState({ icon, title, description, action }: ModalEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-kol-surface/50 border border-kol-border/30 flex items-center justify-center mb-4">
        <i className={`${icon} text-2xl text-kol-text-muted`} />
      </div>
      <h3 className="font-body font-semibold text-white text-sm mb-1">{title}</h3>
      {description && (
        <p className="font-body text-xs text-kol-text-muted max-w-[200px]">
          {description}
        </p>
      )}
      {action && (
        <motion.button
          onClick={action.onClick}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-kol-blue/10 border border-kol-blue/20 text-kol-blue text-xs font-medium hover:bg-kol-blue/15 hover:border-kol-blue/30 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.icon && <i className={`${action.icon} text-sm`} />}
          {action.label}
        </motion.button>
      )}
    </div>
  )
}
