import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "../Logo";

type TabId = "feed";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "feed", label: "Radar", icon: "ri-radar-line" },
];

export interface NetworkConfig {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  balance: number;
  address: string;
  networkLabel: string;
}

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSignOut: () => void;
  balance: number;
  userEmail: string;
  networks: NetworkConfig[];
  totalBalanceUsd: number;
  onDeposit: () => void;
  onWithdraw?: () => void;
  onSearchClick?: () => void;
}

// Search input (visual placeholder)
function SearchInput({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kol-surface/50 border border-[#282828] hover:border-kol-blue/30 hover:bg-kol-surface/70 transition-colors cursor-pointer group min-w-[120px]"
    >
      <i className="ri-search-line text-sm text-kol-text-muted group-hover:text-kol-text-secondary transition-colors" />
      <span className="text-xs text-kol-text-muted group-hover:text-kol-text-secondary transition-colors font-body flex-1">
        Search...
      </span>
      {/* Keyboard shortcut badge */}
      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-kol-border/40 text-kol-text-muted border border-kol-border/30">
        /
      </span>
    </button>
  );
}

// Solana Logo SVG
function SolanaLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.44955 6.75999H12.0395C12.1595 6.75999 12.2695 6.80999 12.3595 6.89999L13.8795 8.45999C14.1595 8.74999 13.9595 9.23999 13.5595 9.23999H3.96955C3.84955 9.23999 3.73955 9.18999 3.64955 9.09999L2.12955 7.53999C1.84955 7.24999 2.04955 6.75999 2.44955 6.75999ZM2.12955 4.68999L3.64955 3.12999C3.72955 3.03999 3.84955 2.98999 3.96955 2.98999H13.5495C13.9495 2.98999 14.1495 3.47999 13.8695 3.76999L12.3595 5.32999C12.2795 5.41999 12.1595 5.46999 12.0395 5.46999H2.44955C2.04955 5.46999 1.84955 4.97999 2.12955 4.68999ZM13.8695 11.3L12.3495 12.86C12.2595 12.95 12.1495 13 12.0295 13H2.44955C2.04955 13 1.84955 12.51 2.12955 12.22L3.64955 10.66C3.72955 10.57 3.84955 10.52 3.96955 10.52H13.5495C13.9495 10.52 14.1495 11.01 13.8695 11.3Z"
        fill="url(#sol-gradient-header)"
      />
      <defs>
        <linearGradient
          id="sol-gradient-header"
          x1="1.77756"
          y1="13.3327"
          x2="13.9679"
          y2="1.14234"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="0.24" stopColor="#8752F3" />
          <stop offset="0.465" stopColor="#5497D5" />
          <stop offset="0.6" stopColor="#43B4CA" />
          <stop offset="0.735" stopColor="#28E0B9" />
          <stop offset="1" stopColor="#19FB9B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// BNB Logo SVG
function BnbLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.57583 9L3.58452 12.0945L6.29036 13.6418V15.4535L2.00097 13.0088V8.09508L3.57583 9ZM3.57583 5.90546V7.70873L2 6.80288V4.99961L3.57583 4.09375L5.15939 4.99961L3.57583 5.90546ZM7.42036 4.99961L8.9962 4.09375L10.5797 4.99961L8.9962 5.90546L7.42036 4.99961Z"
        fill="#F0B90B"
      />
      <path
        d="M4.71436 11.4531V9.64141L6.29019 10.5473V12.3505L4.71436 11.4531ZM7.4202 14.2907L8.99603 15.1966L10.5796 14.2907V16.094L8.99603 16.9998L7.4202 16.094V14.2907ZM12.8396 4.99961L14.4154 4.09375L15.999 4.99961V6.80288L14.4154 7.70873V5.90546L12.8396 4.99961ZM14.4154 12.0945L14.4241 9L15.9999 8.09414V13.0079L11.7106 15.4526V13.6409L14.4154 12.0945Z"
        fill="#F0B90B"
      />
      <path
        d="M13.2853 11.4543L11.7095 12.3517V10.5484L13.2853 9.64258V11.4543Z"
        fill="#F0B90B"
      />
      <path
        d="M13.2854 6.54672L13.2941 8.35843L10.5805 9.9057V13.0077L9.00471 13.9052L7.42888 13.0077V9.9057L4.71532 8.35843V6.54672L6.29791 5.64087L8.99506 7.19564L11.7086 5.64087L13.2922 6.54672H13.2854ZM4.71436 3.45312L8.99603 1L13.2854 3.45312L11.7096 4.35898L8.99603 2.80421L6.29019 4.35898L4.71436 3.45312Z"
        fill="#F0B90B"
      />
    </svg>
  );
}

// Copy button for addresses
function CopyButton({ label, address }: { label: string; address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [address]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-kol-text-muted/50 hover:text-kol-text-muted transition-colors"
    >
      <i
        className={`text-[10px] ${copied ? "ri-check-line text-kol-green" : "ri-file-copy-line"}`}
      />
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}

// Wallet dropdown with balance and actions
function WalletDropdown({
  balance,
  networks,
  totalBalanceUsd,
  onDeposit,
  onWithdraw,
}: {
  balance: number;
  networks: NetworkConfig[];
  totalBalanceUsd: number;
  onDeposit: () => void;
  onWithdraw?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const solNetwork = networks.find((n) => n.id === "sol");
  const bnbNetwork = networks.find((n) => n.id === "bnb");

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeposit = () => {
    setIsOpen(false);
    onDeposit();
  };

  const handleWithdraw = () => {
    if (onWithdraw) {
      setIsOpen(false);
      onWithdraw();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Wallet button trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kol-surface/50 border border-[#282828] hover:border-kol-blue/30 transition-all cursor-pointer group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 rounded-lg bg-kol-blue/0 group-hover:bg-kol-blue/5 transition-colors" />

        {/* Wallet icon */}
        <i className="ri-wallet-3-line text-sm text-kol-text-muted relative z-10" />

        {/* Solana Logo + Balance */}
        <img
          src="/images/solanaLogoMark.svg"
          alt="SOL"
          width={14}
          height={11}
          className="relative z-10"
        />
        <span className="relative z-10 text-sm text-white font-bold">
          {balance.toFixed(2)}
        </span>

        {/* Divider */}
        <div className="relative z-10 w-px h-4 bg-kol-border/50" />

        {/* BNB Logo + Balance */}
        <BnbLogo className="relative z-10 w-[14px] h-[14px]" />
        <span className="relative z-10 text-sm text-white font-bold">
          {bnbNetwork?.balance.toFixed(2) ?? "0.00"}
        </span>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-64 bg-kol-bg border border-kol-border rounded-lg overflow-hidden z-50"
          >
            {/* Balance Header */}
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-kol-text-muted/50">Balance</span>
                <div className="flex gap-3">
                  {solNetwork && (
                    <CopyButton label="Solana" address={solNetwork.address} />
                  )}
                  {bnbNetwork && (
                    <CopyButton label="EVM" address={bnbNetwork.address} />
                  )}
                </div>
              </div>

              {/* Total Balance USD */}
              <div className="text-lg font-semibold text-white">
                ${totalBalanceUsd.toFixed(2)}
              </div>
            </div>

            {/* Swap Row */}
            <div className="mt-3 py-2.5 border-t border-b border-kol-border flex items-center justify-between px-4 cursor-pointer hover:bg-kol-surface-elevated/30 transition-colors">
              {/* SOL Side */}
              <div className="flex items-center gap-2 w-1/3">
                <SolanaLogo className="w-4 h-4" />
                <span className="text-sm font-semibold text-white">
                  {solNetwork?.balance.toFixed(2) ?? "0.00"}
                </span>
              </div>

              {/* Swap Icon */}
              <div className="flex items-center justify-center">
                <i className="ri-arrow-left-right-line text-kol-text-muted/50" />
              </div>

              {/* BNB Side */}
              <div className="flex items-center gap-2 w-1/3 justify-end">
                <span className="text-sm font-semibold text-white">
                  {bnbNetwork?.balance.toFixed(2) ?? "0.00"}
                </span>
                <BnbLogo className="w-4 h-4" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 p-3">
              <button
                onClick={handleDeposit}
                className="h-8 rounded-md text-sm font-medium bg-kol-blue/25 hover:bg-kol-blue/40 text-white transition-colors border border-kol-blue/40"
              >
                Deposit
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!onWithdraw}
                className="h-8 rounded-md text-sm font-medium bg-kol-surface border border-kol-border hover:bg-kol-surface-elevated text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Withdraw
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// User dropdown with avatar
function UserDropdown({
  email,
  onSignOut,
}: {
  email: string;
  onSignOut: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get initials from email
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-full bg-gradient-to-br from-kol-blue/30 to-kol-blue/10 border border-kol-border/40 hover:border-kol-blue/40 flex items-center justify-center transition-all group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Avatar glow */}
        <div className="absolute inset-0 bg-kol-blue/0 group-hover:bg-kol-blue/10 transition-colors" />

        {/* Initials */}
        <span className="text-[10px] font-bold text-white relative z-10">
          {initials}
        </span>

        {/* Online status dot */}
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-kol-green border-2 border-kol-bg z-20"
          style={{ boxShadow: "0 0 6px rgba(0, 196, 107, 0.6)" }}
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
              boxShadow:
                "0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03) inset",
            }}
          >
            {/* Subtle glow */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-kol-blue/10 blur-2xl pointer-events-none" />

            {/* User info */}
            <div className="relative px-3 py-2.5 border-b border-kol-border/30">
              <p className="text-[10px] text-kol-text-muted uppercase tracking-wider mb-0.5 font-medium">
                Signed in as
              </p>
              <p className="text-xs text-white font-body truncate">{email}</p>
            </div>

            {/* Menu items */}
            <div className="relative py-1">
              <DropdownItem
                icon="ri-user-3-line"
                label="Profile"
                onClick={() => setIsOpen(false)}
              />
              <DropdownItem
                icon="ri-settings-3-line"
                label="Settings"
                onClick={() => setIsOpen(false)}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-kol-border/30 mx-2" />

            {/* Sign out */}
            <div className="relative py-1">
              <DropdownItem
                icon="ri-logout-box-line"
                label="Sign Out"
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                variant="danger"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dropdown menu item
function DropdownItem({
  icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  const colorClass =
    variant === "danger"
      ? "text-kol-red hover:bg-kol-red/10"
      : "text-kol-text-secondary hover:text-white hover:bg-kol-surface/80";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-body transition-colors ${colorClass}`}
    >
      <i className={`${icon} text-sm`} />
      <span>{label}</span>
    </button>
  );
}

export function Header({
  activeTab,
  onTabChange,
  onSignOut,
  balance,
  userEmail,
  networks,
  totalBalanceUsd,
  onDeposit,
  onWithdraw,
  onSearchClick,
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
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0, 123, 255, 0.25) 50%, transparent 100%)",
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
                    boxShadow: "0 0 8px rgba(0, 123, 255, 0.5)",
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}

              <i
                className={`${tab.icon} text-sm transition-colors duration-200 ${
                  activeTab === tab.id ? "text-white" : "text-kol-text-muted"
                }`}
              />

              <span
                className={`text-sm font-semibold transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-kol-text-muted hover:text-kol-text-secondary"
                }`}
              >
                {tab.label}
              </span>

              {/* Live indicator for Feed */}
              {tab.id === "feed" && (
                <span className="w-2 h-2 rounded-full bg-kol-red shadow-sm shadow-kol-red/50 animate-pulse" />
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Right side: Search, Wallet, User */}
      <div className="relative z-10 flex items-center gap-2">
        <SearchInput onClick={onSearchClick} />
        <WalletDropdown
          balance={balance}
          networks={networks}
          totalBalanceUsd={totalBalanceUsd}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
        />
        <UserDropdown email={userEmail} onSignOut={onSignOut} />
      </div>
    </motion.header>
  );
}
