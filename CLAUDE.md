# LaunchKOL Browser Extension

## Project Overview
Browser extension for LaunchKOL - "The most Advanced Launchpad for Solana". This extension mirrors the functionality of the main LaunchKOL web application, allowing users to trade and interact with Solana tokens directly from their browser.

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom color palette
- **Animations**: Framer Motion
- **Icons**: Remixicon

## Project Structure
```
src/
├── components/
│   ├── AuthScreen.tsx    # Main authentication flow (signup/login/OTP/recovery)
│   └── Logo.tsx          # LaunchKOL branding component
├── styles/
│   └── globals.css       # Global styles and Tailwind config
├── App.tsx               # Root component
└── main.tsx              # Entry point
```

## Design System

### Colors (defined in tailwind.config.js)
- `kol-bg`: #0a0a0a (main background)
- `kol-surface`: #101010
- `kol-surface-elevated`: #1a1a1a
- `kol-border`: #2a2a2a
- `kol-blue`: #007bff (primary accent)
- `kol-blue-hover`: #3390ff
- `kol-green`: #00c46b (success)
- `kol-red`: #ff4d4f (error)

### Typography
- Display: Sora
- Body: DM Sans
- Mono: JetBrains Mono

### Extension Dimensions
- Width: 380px
- Height: 540px

## Commands
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production (outputs to dist/)
```

## Loading as Extension
1. Run `npm run build`
2. Open Chrome → `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" → select `dist/` folder

## Auth Flow
1. **Credentials**: Email input (+ password for login, invite code for signup)
2. **Password Creation** (signup only): Create password with validation requirements
3. **OTP Verification** (login only): 6-digit code sent to email
4. **Recovery Key** (signup only): Display 12-word seed phrase for wallet backup

## API Integration
Currently uses mock/simulated API calls. Connect to backend at `http://localhost:3005` (same as main LaunchKOL app).

## Notes
- Dark mode only (matches main LaunchKOL branding)
- Logo SVGs use `fillRule="evenodd"` for proper letter rendering (A, O cutouts)
- Background uses layered effects: gradient orbs, grid pattern, floating particles, vignette
