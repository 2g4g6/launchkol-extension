/**
 * Modal Examples - Reference implementations for the 3 modal styles
 *
 * This file demonstrates how to use the Modal component to recreate
 * the styles from Uxento, Axiom, and RapidLaunch.
 *
 * Import this component and add buttons to trigger each modal to see them in action.
 */

import { useState } from 'react'
import { Modal, ModalListItem, ModalActionButton, ModalEmptyState } from '../ui/Modal'

// Mock data for examples
const MOCK_COINS = [
  {
    id: '1',
    name: 'HELLO NIGGAS!??',
    symbol: 'HELLO',
    image: 'https://picsum.photos/seed/coin1/100/100',
    address: 'G16GMx...pump',
    platform: 'pump',
    mc: '$3.4K',
    volume: '$0.02',
    liquidity: '$7.36K',
    age: '1 minute',
  },
  {
    id: '2',
    name: 'clawd',
    symbol: 'CLAWD',
    image: 'https://picsum.photos/seed/coin2/100/100',
    address: '81yaj7...pump',
    platform: 'pump',
    mc: '$3.4K',
    volume: '$0.02',
    liquidity: '$7.4K',
    age: '4m',
  },
  {
    id: '3',
    name: 'Claude',
    symbol: 'CLAUDE',
    image: 'https://picsum.photos/seed/coin3/100/100',
    address: 'Claud3...',
    platform: 'pump',
    mc: '$23K',
    volume: '$2K',
    liquidity: '$17K',
    age: '9d',
  },
  {
    id: '4',
    name: 'SOLORA',
    symbol: 'SOLORA',
    image: 'https://picsum.photos/seed/coin4/100/100',
    address: 'S0L0R4...',
    platform: 'bonk',
    mc: '$2K',
    volume: '$0',
    liquidity: '$5K',
    age: '2mo',
  },
]

// ==================================
// Style 1: Uxento Modal
// - Title + text "Close" button
// - Filter tabs with icons (All, Pump, Bonk, Bags)
// - Toolbar icons on right (clock, chart, diamond)
// - Coin list with swap/paw icons and lightning action
// ==================================
export function UxentoStyleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSort, setActiveSort] = useState('time')

  const filterTabs = [
    { id: 'all', label: 'All', icon: 'ri-stack-line' },
    { id: 'pump', label: 'Pump', icon: 'ri-drop-line', color: '#22c55e' },
    { id: 'bonk', label: 'Bonk', icon: 'ri-fire-line', color: '#f97316' },
    { id: 'bags', label: 'Bags', icon: 'ri-wallet-3-line', color: '#eab308' },
  ]

  const toolbarIcons = [
    { id: 'time', icon: 'ri-time-line', tooltip: 'Sort by time', active: activeSort === 'time' },
    { id: 'chart', icon: 'ri-line-chart-line', tooltip: 'Sort by volume', active: activeSort === 'chart' },
    { id: 'gem', icon: 'ri-vip-diamond-line', tooltip: 'Premium only', active: activeSort === 'gem' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="hello"
      closeButtonStyle="text"
      size="lg"
      filterTabs={filterTabs}
      activeFilterId={activeFilter}
      onFilterChange={setActiveFilter}
      toolbarIcons={toolbarIcons}
      onToolbarClick={setActiveSort}
    >
      <div className="divide-y divide-kol-border/20">
        {MOCK_COINS.map((coin) => (
          <ModalListItem
            key={coin.id}
            image={coin.image}
            badge="OS"
            badgeColor="green"
            title={coin.name}
            subtitle={`${coin.address} \u00B7 ${coin.platform}`}
            stats={[
              { label: 'M', value: coin.mc },
              { label: 'V (1H)', value: coin.volume },
              { label: 'L', value: coin.liquidity },
            ]}
            socialIcons={[
              { icon: 'ri-file-copy-line' },
              { icon: 'ri-twitter-x-line' },
              { icon: 'ri-global-line' },
            ]}
            actions={[
              { icon: 'ri-swap-line', onClick: () => console.log('Swap'), tooltip: 'Swap' },
              { icon: 'ri-bear-smile-line', onClick: () => console.log('Paw'), tooltip: 'Paw' },
              { icon: 'ri-flashlight-line', onClick: () => console.log('Flash'), variant: 'primary', tooltip: 'Quick Buy' },
            ]}
          />
        ))}
      </div>
    </Modal>
  )
}

// ==================================
// Style 2: Axiom Modal
// - Search bar at top
// - "My Tokens" toggle button
// - Sort dropdown (Newest, MC: Off)
// - Coin list with Vamp/Trade buttons
// ==================================
export function AxiomStyleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const [myTokens, setMyTokens] = useState(false)
  const [sort, setSort] = useState('newest')

  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'oldest', label: 'Oldest' },
    { id: 'mc-high', label: 'MC: High' },
    { id: 'mc-low', label: 'MC: Low' },
  ]

  const filteredCoins = MOCK_COINS.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      size="lg"
      showSearch={true}
      searchPlaceholder="Search by name, ticker, or CA..."
      searchValue={search}
      onSearchChange={setSearch}
      toggleLabel="My Tokens"
      toggleIcon="ri-wallet-3-line"
      toggleActive={myTokens}
      onToggleClick={() => setMyTokens(!myTokens)}
      sortOptions={sortOptions}
      activeSortId={sort}
      onSortChange={setSort}
      showSortDropdown={true}
    >
      {filteredCoins.length > 0 ? (
        <div className="divide-y divide-kol-border/20">
          {filteredCoins.map((coin) => (
            <ModalListItem
              key={coin.id}
              image={coin.image}
              badge="OS"
              badgeColor="green"
              title={`${coin.symbol} ${coin.name.slice(0, 10)}...`}
              subtitle={coin.age}
              socialIcons={[
                { icon: 'ri-twitter-x-line' },
                { icon: 'ri-global-line' },
              ]}
              stats={[
                { label: 'MC', value: coin.mc },
                { label: 'L', value: coin.liquidity },
              ]}
              actions={[
                { icon: 'ri-close-line', onClick: () => console.log('Vamp'), tooltip: 'Vamp' },
                { icon: 'ri-download-line', onClick: () => console.log('Trade'), variant: 'primary', tooltip: 'Trade' },
              ]}
            />
          ))}
        </div>
      ) : (
        <ModalEmptyState
          icon="ri-search-line"
          title="No tokens found"
          description="Try a different search term"
        />
      )}
    </Modal>
  )
}

// ==================================
// Style 3: RapidLaunch Modal
// - Filter chips (Pump, Bonk, Bags, USD1, OG Mode, Graduated)
// - Sort icons (clock, chart, bar chart, gem)
// - Search bar with Esc hint
// - "History" section label
// - Coin list with circular action button
// ==================================
export function RapidLaunchStyleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('pump')
  const [activeSort, setActiveSort] = useState('time')

  const filterTabs = [
    { id: 'pump', label: 'Pump', icon: 'ri-drop-line', color: '#22c55e' },
    { id: 'bonk', label: 'Bonk', icon: 'ri-fire-line', color: '#f97316' },
    { id: 'bags', label: 'Bags', icon: 'ri-wallet-3-line', color: '#eab308' },
    { id: 'usd1', label: 'USD1', icon: 'ri-money-dollar-circle-line', color: '#3b82f6' },
  ]

  const sortOptions = [
    { id: 'time', icon: 'ri-time-line', label: 'Time' },
    { id: 'chart', icon: 'ri-line-chart-line', label: 'Volume' },
    { id: 'bar', icon: 'ri-bar-chart-line', label: 'Market Cap' },
    { id: 'gem', icon: 'ri-vip-diamond-line', label: 'Gems' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      size="lg"
      filterTabs={filterTabs}
      activeFilterId={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={sortOptions}
      activeSortId={activeSort}
      onSortChange={setActiveSort}
      showSearch={true}
      searchPlaceholder="Search by name, ticker, or CA..."
      searchValue={search}
      onSearchChange={setSearch}
      showEscHint={true}
      sectionLabel="History"
    >
      <div className="divide-y divide-kol-border/20">
        {MOCK_COINS.map((coin) => (
          <ModalListItem
            key={coin.id}
            image={coin.image}
            title={`${coin.symbol} ${coin.name.slice(0, 6)}...`}
            subtitle={coin.age}
            socialIcons={[
              { icon: 'ri-group-line' },
              { icon: 'ri-global-line' },
              { icon: 'ri-at-line' },
              { icon: 'ri-telegram-line' },
            ]}
            stats={[
              { label: 'MC', value: coin.mc },
              { label: 'V', value: coin.volume },
              { label: 'L', value: coin.liquidity, color: '#22c55e' },
            ]}
            actions={[
              { icon: 'ri-arrow-up-line', onClick: () => console.log('Buy'), variant: 'success', tooltip: 'Quick Buy' },
            ]}
          />
        ))}
      </div>
    </Modal>
  )
}

// ==================================
// Demo Component - Shows all 3 styles
// ==================================
export function ModalExamplesDemo() {
  const [uxentoOpen, setUxentoOpen] = useState(false)
  const [axiomOpen, setAxiomOpen] = useState(false)
  const [rapidOpen, setRapidOpen] = useState(false)

  return (
    <div className="p-6 space-y-4">
      <h2 className="font-display font-bold text-white text-lg mb-4">Modal Examples</h2>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setUxentoOpen(true)}
          className="px-4 py-2 rounded-lg bg-kol-blue text-white text-sm font-medium hover:bg-kol-blue-hover transition-colors"
        >
          Uxento Style
        </button>
        <button
          onClick={() => setAxiomOpen(true)}
          className="px-4 py-2 rounded-lg bg-kol-green text-white text-sm font-medium hover:opacity-80 transition-colors"
        >
          Axiom Style
        </button>
        <button
          onClick={() => setRapidOpen(true)}
          className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:opacity-80 transition-colors"
        >
          RapidLaunch Style
        </button>
      </div>

      <UxentoStyleModal isOpen={uxentoOpen} onClose={() => setUxentoOpen(false)} />
      <AxiomStyleModal isOpen={axiomOpen} onClose={() => setAxiomOpen(false)} />
      <RapidLaunchStyleModal isOpen={rapidOpen} onClose={() => setRapidOpen(false)} />
    </div>
  )
}
