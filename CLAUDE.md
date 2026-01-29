# LaunchKOL Browser Extension

IMPORTANT: ALWAYS USE BUN OVER NPM
IMPORTANT: MAKE SURE THAT YOU COMMIT AND PUSH ALL THE CHANGES YOU MAKE. DO IT IN A SINGULAR COMMAND TO SAVE TIME. DO IT EVERY TIME YOU MAKE A CHANGE.

## Vision: "Honey for Crypto"

LaunchKOL Extension is a browser extension that provides value-added overlay services on existing crypto trading platforms, bundlers, and swap services. Like Honey (acquired by PayPal for $4B) revolutionized e-commerce savings, LaunchKOL revolutionizes crypto trading by:

1. **Routing trades** through LaunchKOL at lower fees than competitors
2. **Capturing affiliate revenue** from swap partners
3. **Providing superior tools** (Twitter tracking, bundling, analytics) on top of existing platforms

**Key Principle**: Users keep their existing workflow (GMGN, Photon, Axiom, etc.) but get LaunchKOL benefits (lower fees, extra features) through our overlay.

---

## Business Model

### Fee Strategy
| Phase | Trading Fee | Strategy |
|-------|-------------|----------|
| Launch | 0% | Marketing - attract users from competitors |
| Growth | 0.5% | Still undercuts all competitors |

### Competitor Fees We're Undercutting
| Platform | Their Fee | Our Advantage |
|----------|-----------|---------------|
| GMGN | 1.5% | Save 1-1.5% per trade |
| Photon | 1.8% | Save 1.3-1.8% per trade |
| Axiom | 0.8-0.95% | Save 0.3-0.95% per trade |

### Revenue Streams
1. **Trading fees**: 0.5% on trades routed through LaunchKOL (after launch phase)
2. **Swap affiliates**: 40% revenue share from FixedFloat, similar from SimpleSwap, SwapSpace
3. **Bundler fees**: % on bundle operations
4. **Token launch fees**: % on token creations
5. **Premium tiers**: Extra wallets, advanced features, priority support

---

## Target Platforms

### Trading Platforms (Overlay for Fee Capture)
- **gmgn.ai** - AI-driven trading bot (1.5% fee)
- **photon-sol.tinyastro.io** - Lightweight trading interface (1.8% fee)
- **axiom.trade** - Advanced trading platform (0.8% fee)
- **bullx.io** - Trading terminal
- **raydium.io** - Solana DEX
- **jup.ag** - Jupiter aggregator

### Bundlers (Alternative Services)
- **Vortex** (memecoinbundler.com) - Token bundling, multi-wallet, smart sell
- Similar bundling tools

### Swap Services (Affiliate Revenue)
- **FixedFloat** (ff.io) - 40% affiliate revenue share
- **SimpleSwap** - Affiliate program
- **SwapSpace** - Aggregator affiliate
- **ChangeNOW** - Affiliate program

### Social Platforms (Tracking & Launch)
- **Twitter/X** - Wallet extraction, launch from tweets, alpha tracking
- **Discord** - Alpha group alerts

### NOT Targeting Directly
- **pump.fun** - Cannot replace their ecosystem fees
- **bonk.fun** - Same limitation
- We integrate WITH these platforms, not replace them

---

## Technical Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom kol-* color palette
- **Animations**: Framer Motion
- **Icons**: Remixicon
- **Extension**: Chrome Manifest V3

---

## Architecture

```
LaunchKOL-Extension/
├── src/
│   ├── popup/                    # Main extension popup (380x540px)
│   │   ├── components/
│   │   │   ├── Dashboard.tsx     # Main trading dashboard
│   │   │   ├── LaunchPanel.tsx   # Token launch interface
│   │   │   ├── TradePanel.tsx    # Buy/sell interface
│   │   │   ├── PortfolioPanel.tsx# Holdings & PnL
│   │   │   ├── SwapPanel.tsx     # Swap aggregator
│   │   │   ├── SettingsPanel.tsx # User settings
│   │   │   └── AuthScreen.tsx    # Login/signup (DONE)
│   │   └── App.tsx
│   │
│   ├── background/               # Service worker
│   │   ├── index.ts              # Main background script
│   │   ├── api.ts                # Backend API calls
│   │   ├── storage.ts            # Chrome storage management
│   │   └── messaging.ts          # Content script communication
│   │
│   ├── content/                  # Content scripts (site injections)
│   │   ├── trading/              # Trading platform overlays
│   │   │   ├── gmgn.ts
│   │   │   ├── photon.ts
│   │   │   ├── axiom.ts
│   │   │   └── common.ts         # Shared overlay components
│   │   ├── bundler/              # Bundler integrations
│   │   │   └── vortex.ts
│   │   ├── swap/                 # Swap site overlays
│   │   │   └── common.ts
│   │   ├── twitter/              # Twitter/X integration
│   │   │   ├── wallet-tracker.ts # Extract wallets from profiles
│   │   │   ├── tweet-launch.ts   # Launch coin from tweet
│   │   │   └── inject.tsx        # React components for Twitter
│   │   └── styles/               # Injected CSS
│   │
│   ├── shared/                   # Shared utilities
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   │
│   └── styles/
│       └── globals.css
│
├── manifest.json                 # Chrome extension manifest
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Content Script Injection Map

| Site Pattern | Script | Purpose |
|--------------|--------|---------|
| `*://gmgn.ai/*` | trading/gmgn.ts | Inject LaunchKOL buy/sell overlay |
| `*://photon-sol.tinyastro.io/*` | trading/photon.ts | Inject LaunchKOL buy/sell overlay |
| `*://axiom.trade/*` | trading/axiom.ts | Inject LaunchKOL buy/sell overlay |
| `*://bullx.io/*` | trading/bullx.ts | Inject LaunchKOL buy/sell overlay |
| `*://memecoinbundler.com/*` | bundler/vortex.ts | Offer LaunchKOL bundling |
| `*://twitter.com/*`, `*://x.com/*` | twitter/*.ts | Wallet tracking, tweet launch |
| `*://changenow.io/*`, etc. | swap/common.ts | Show better rates, affiliate |

---

## Feature Phases

### Phase 1: Standalone Dashboard (Current Priority)
The popup should be fully functional without needing other sites.

**Components to Build:**
- [ ] Dashboard home with quick actions
- [ ] Token launch interface (metadata, image, settings)
- [ ] Buy/sell interface (token address, amount, slippage)
- [ ] Portfolio view (holdings, PnL, balance)
- [ ] Wallet management (deposit, withdraw, balance)
- [ ] Settings (fees, slippage defaults, notifications)

**API Integration:**
- All endpoints already exist in backend (see API section)

### Phase 2: Trading Platform Overlay
Inject on GMGN, Photon, Axiom to capture trades.

**Overlay Features:**
- "Trade with LaunchKOL" button near native buy/sell
- Fee comparison tooltip ("Save X% with LaunchKOL")
- One-click trade routing through LaunchKOL
- Maintain user's existing UI/workflow

**Implementation:**
1. Detect token being viewed on platform
2. Inject floating button/panel
3. On click, open mini-trade modal OR route to popup
4. Execute trade through LaunchKOL backend
5. Show confirmation with fee savings

### Phase 3: Bundler Integration
Compete with Vortex and similar tools.

**Features:**
- Multi-wallet management
- Bundle token launches
- Smart sell (auto-sell at targets)
- Anti-MEV protection
- Wallet warmup tools

### Phase 4: Twitter Integration
Extract alpha and enable tweet-based launches.

**Features:**
- Detect Solana wallet addresses in tweets/bios
- "Track Wallet" button injection
- "Launch Coin from Tweet" (extract metadata from tweet)
- Alpha alert notifications
- KOL wallet tracking

### Phase 5: Swap Aggregator
Capture affiliate revenue from swaps.

**In-Popup:**
- Swap interface with best rates
- Aggregates FixedFloat, SimpleSwap, etc.
- Shows comparison of rates

**Site Overlay:**
- Detect when user is on swap site
- Show "Better rate available" if LaunchKOL partner has better rate
- One-click redirect with affiliate link

---

## API Endpoints (Backend at localhost:3005)

### Authentication
```
POST /api/auth/signup          # Create account
POST /api/auth/login           # Request OTP
POST /api/auth/verify-login-otp # Verify OTP
POST /api/auth/phantom         # Phantom wallet auth
POST /api/auth/refresh         # Refresh token
POST /api/auth/logout          # Logout
GET  /api/auth/me              # Get current user
GET  /api/auth/recovery-key    # Get seed phrase
```

### Wallet
```
GET  /api/wallet/balance       # SOL balance + USD
GET  /api/wallet/max-withdrawable
POST /api/wallet/create-transaction
POST /api/wallet/withdraw
```

### Tokens
```
POST /api/tokens/create        # Launch token
GET  /api/tokens               # User's tokens
GET  /api/tokens/status/:id    # Creation status
POST /api/tokens/buy           # Buy token
POST /api/tokens/sell          # Sell token
POST /api/tokens/estimate-sell
POST /api/tokens/metadata      # Get token metadata
```

### Trading
```
GET  /api/price/sol            # Current SOL price
GET  /api/fees/recommendations # Priority fees + Jito tips
```

### Referrals & Rewards
```
POST /api/referrals/generate
GET  /api/referrals/stats
POST /api/referrals/claim
GET  /api/ranks/user
```

### Analytics (BullX Integration)
```
POST /api/bullx/subscribe
GET  /api/bullx/stats/:address
GET  /api/bullx/top-traders/:address
GET  /api/bullx/my-pnl
```

---

## Design System

### Colors
```css
--kol-bg: #0a0a0a;              /* Main background */
--kol-surface: #101010;          /* Card backgrounds */
--kol-surface-elevated: #1a1a1a; /* Elevated elements */
--kol-border: #2a2a2a;           /* Borders */
--kol-blue: #007bff;             /* Primary accent */
--kol-blue-hover: #3390ff;       /* Primary hover */
--kol-green: #00c46b;            /* Success */
--kol-red: #ff4d4f;              /* Error */
--kol-text: #ffffff;             /* Primary text */
--kol-text-muted: #888888;       /* Secondary text */
```

### Typography
- **Display**: Sora (headings, logo)
- **Body**: DM Sans (all body text)
- **Mono**: JetBrains Mono (addresses, numbers)

### Extension Dimensions
- **Popup Width**: 380px
- **Popup Height**: 540px

### Animations
- Use Framer Motion for transitions
- Subtle fade/slide for panel changes
- Loading spinners for async operations
- Success/error toasts

---

## Manifest Configuration

```json
{
  "manifest_version": 3,
  "name": "LaunchKOL",
  "version": "1.0.0",
  "description": "Honey for Crypto - Trade smarter with lower fees",
  "permissions": [
    "storage",
    "activeTab",
    "tabs"
  ],
  "host_permissions": [
    "*://gmgn.ai/*",
    "*://photon-sol.tinyastro.io/*",
    "*://axiom.trade/*",
    "*://bullx.io/*",
    "*://memecoinbundler.com/*",
    "*://twitter.com/*",
    "*://x.com/*",
    "*://*.changenow.io/*",
    "*://*.simpleswap.io/*",
    "*://*.fixedfloat.com/*",
    "*://ff.io/*"
  ],
  "action": {
    "default_popup": "index.html",
    "default_icon": { ... }
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["*://gmgn.ai/*"],
      "js": ["content/trading/gmgn.js"],
      "css": ["content/styles/overlay.css"]
    },
    // ... other content scripts
  ]
}
```

---

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production (outputs to dist/)
npm run watch    # Build with watch mode for development
```

### Loading Extension in Chrome
1. Run `npm run build`
2. Open Chrome -> `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" -> select `dist/` folder
5. Pin extension to toolbar

---

## Current State

### Completed
- [x] Authentication flow (signup, login, OTP, recovery key)
- [x] Logo and branding components
- [x] Design system (colors, typography, animations)
- [x] Basic extension structure

### In Progress
- [ ] Dashboard home panel
- [ ] Token launch interface
- [ ] Buy/sell interface

### Not Started
- [ ] Content scripts for trading platforms
- [ ] Twitter integration
- [ ] Swap aggregator
- [ ] Bundler features
- [ ] Background service worker

---

## Notes

- **Dark mode only** - matches LaunchKOL branding
- **Standalone first** - popup must work without content scripts
- **Non-invasive overlays** - don't break existing site functionality
- **Fee transparency** - always show users their savings
- **Backend is separate** - this repo is frontend only, API at localhost:3005
