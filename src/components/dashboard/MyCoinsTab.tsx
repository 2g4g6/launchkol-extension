import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CoinCard, CoinData } from './CoinCard'

// Mock data with new fields
const MOCK_COINS: CoinData[] = [
  {
    id: '1',
    name: 'DogWifHat',
    symbol: 'WIF',
    image: 'https://pbs.twimg.com/profile_images/1742059584087289856/viSxBP1h_400x400.jpg',
    address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    holdings: 2.45,
    holdingsUsd: 245.50,
    pnl: 0.89,
    pnlPercent: 57.2,
    marketCap: 156000,
    launchedAt: new Date(Date.now() - 3600000 * 24),
    platform: 'pump',
    twitterUrl: 'https://x.com/dogwifcoin/status/1234567890',
    axiomUrl: 'https://axiom.trade/t/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    progressPercent: 85,
    tradingStats: { boughtAmount: 1.5, soldAmount: 0.6 },
    buyTxns: 335,
    sellTxns: 199,
    buyVolumeUsd: 135000,
    sellVolumeUsd: 132000,
  },
  {
    id: '2',
    name: 'Bonk',
    symbol: 'BONK',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    holdings: 0.85,
    holdingsUsd: 85.00,
    pnl: -0.12,
    pnlPercent: -12.8,
    marketCap: 89000,
    launchedAt: new Date(Date.now() - 3600000 * 2),
    platform: 'bonk',
    twitterUrl: 'https://x.com/bonaborabonk/status/1234567891',
    axiomUrl: 'https://axiom.trade/t/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    progressPercent: 42,
    tradingStats: { boughtAmount: 0.97, soldAmount: 0 },
    buyTxns: 128,
    sellTxns: 45,
    buyVolumeUsd: 45000,
    sellVolumeUsd: 12000,
  },
  {
    id: '3',
    name: 'Myro',
    symbol: 'MYRO',
    image: 'https://pbs.twimg.com/profile_images/1755899881783185408/Mtp0uwfM_400x400.jpg',
    address: 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
    holdings: 5.20,
    holdingsUsd: 520.00,
    pnl: 2.34,
    pnlPercent: 82.1,
    marketCap: 445000,
    launchedAt: new Date(Date.now() - 3600000 * 48),
    platform: 'pump',
    twitterUrl: 'https://x.com/myro_sol/status/9876543210',
    axiomUrl: 'https://axiom.trade/t/HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
    progressPercent: 100,
    tradingStats: { boughtAmount: 2.86, soldAmount: 0 },
    buyTxns: 892,
    sellTxns: 234,
    buyVolumeUsd: 285000,
    sellVolumeUsd: 78000,
  },
]

interface MyCoinsTabProps {
  balance: number
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

export function MyCoinsTab({ balance }: MyCoinsTabProps) {
  const [coins] = useState<CoinData[]>(MOCK_COINS)
  const [sortBy, setSortBy] = useState<'recent' | 'pnl' | 'holdings'>('recent')

  const sortedCoins = [...coins].sort((a, b) => {
    switch (sortBy) {
      case 'pnl':
        return b.pnlPercent - a.pnlPercent
      case 'holdings':
        return b.holdings - a.holdings
      case 'recent':
      default:
        return b.launchedAt.getTime() - a.launchedAt.getTime()
    }
  })

  const totalHoldings = coins.reduce((acc, c) => acc + c.holdings, 0)
  const totalPnl = coins.reduce((acc, c) => acc + c.pnl, 0)

  const handleView = (coin: CoinData) => {
    window.open(`https://pump.fun/${coin.address}`, '_blank')
  }

  const handleDevPanel = (coin: CoinData) => {
    console.log('Dev panel for:', coin.symbol)
  }

  const handleRelaunch = (coin: CoinData) => {
    console.log('Relaunch for:', coin.symbol)
  }

  return (
    <motion.div
      className="flex flex-col h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Balance Card */}
      <motion.div className="mx-3 mt-3 mb-2" variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#9945FF]/15 via-kol-surface-elevated/80 to-[#14F195]/10 border border-[#9945FF]/25 p-4 backdrop-blur-sm">
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(153, 69, 255, 0.3) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 5, 0],
              y: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(20, 241, 149, 0.25) 0%, transparent 70%)',
              filter: 'blur(15px)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              x: [0, -3, 0],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* SOL Icon with glow */}
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center shadow-lg">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                {/* Icon glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] blur-lg opacity-40 -z-10" />
              </div>
              <div>
                <p className="text-[10px] text-kol-text-muted uppercase tracking-wider font-medium mb-0.5">Wallet Balance</p>
                <p className="text-2xl font-mono font-bold text-white tracking-tight">
                  {balance.toFixed(4)}
                  <span className="text-sm text-kol-text-secondary ml-1.5 font-medium">SOL</span>
                </p>
              </div>
            </div>

            {/* Deposit button */}
            <motion.button
              className="relative px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-[11px] font-semibold text-white overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <span className="relative flex items-center gap-1.5">
                <i className="ri-add-line text-sm" />
                Deposit
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row with glass-morphism */}
      <motion.div
        className="flex items-center justify-between mx-3 mb-2 px-4 py-3 rounded-xl bg-kol-surface/40 backdrop-blur-sm border border-kol-border/30"
        variants={itemVariants}
      >
        <div className="flex items-center gap-5">
          <div>
            <p className="text-[9px] text-kol-text-muted uppercase tracking-wide mb-0.5">Holdings</p>
            <p className="text-sm font-mono font-semibold text-white">
              {totalHoldings.toFixed(2)} <span className="text-kol-text-muted text-[10px] font-normal">SOL</span>
            </p>
          </div>
          <div className="h-8 w-px bg-kol-border/30" />
          <div>
            <p className="text-[9px] text-kol-text-muted uppercase tracking-wide mb-0.5">Total PnL</p>
            <p className={`text-sm font-mono font-semibold flex items-center gap-0.5 ${totalPnl >= 0 ? 'text-kol-green' : 'text-kol-red'}`}>
              <i className={`text-xs ${totalPnl >= 0 ? 'ri-arrow-up-s-fill' : 'ri-arrow-down-s-fill'}`} />
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none text-[10px] bg-kol-surface-elevated/80 border border-kol-border/40 rounded-lg pl-2.5 pr-6 py-1.5 text-kol-text-secondary focus:border-kol-blue/50 transition-colors cursor-pointer"
          >
            <option value="recent">Recent</option>
            <option value="pnl">PnL</option>
            <option value="holdings">Holdings</option>
          </select>
          <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-xs text-kol-text-muted pointer-events-none" />
        </div>
      </motion.div>

      {/* Section header */}
      <motion.div
        className="flex items-center justify-between px-4 py-1.5"
        variants={itemVariants}
      >
        <span className="text-[11px] font-semibold text-kol-text-muted uppercase tracking-wide">
          Your Holdings
        </span>
        <span className="text-[10px] font-mono text-kol-text-tertiary bg-kol-surface/50 px-2 py-0.5 rounded-full">
          {coins.length} tokens
        </span>
      </motion.div>

      {/* Coins List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-2 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {sortedCoins.length > 0 ? (
            sortedCoins.map((coin, index) => (
              <CoinCard
                key={coin.id}
                coin={coin}
                index={index}
                onView={handleView}
                onDevPanel={handleDevPanel}
                onRelaunch={handleRelaunch}
              />
            ))
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center h-full py-12 text-center"
              variants={itemVariants}
            >
              <motion.div
                className="relative mb-5"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-kol-surface-elevated/50 backdrop-blur-sm border border-kol-border/40 flex items-center justify-center">
                  <i className="ri-coin-line text-3xl text-kol-text-muted" />
                </div>
                <div
                  className="absolute inset-0 rounded-2xl opacity-50 blur-xl -z-10"
                  style={{
                    background: 'radial-gradient(circle, rgba(153, 69, 255, 0.2) 0%, transparent 70%)',
                  }}
                />
              </motion.div>
              <p className="text-sm font-body font-semibold text-white mb-1">No coins yet</p>
              <p className="text-xs text-kol-text-muted">Launch your first token to see it here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
