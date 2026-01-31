export interface ThemeDefinition {
  id: string
  name: string
  accent: string
  variables: Record<string, string>
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function lightenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount))
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount))
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function generateAccentVariants(hex: string): {
  blue: string
  blueHover: string
  blueGlow: string
} {
  const rgb = hexToRgb(hex)
  if (!rgb) return { blue: hex, blueHover: hex, blueGlow: hex }
  return {
    blue: hex,
    blueHover: lightenHex(hex, 0.2),
    blueGlow: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
  }
}

const DARK_BASE: Record<string, string> = {
  '--kol-bg': '#0a0a0a',
  '--kol-surface': '#101010',
  '--kol-surface-elevated': '#1a1a1a',
  '--kol-border': '#2a2a2a',
  '--kol-border-hover': '#3a3a3a',
  '--kol-blue': '#007bff',
  '--kol-blue-hover': '#3390ff',
  '--kol-blue-glow': 'rgba(0, 123, 255, 0.4)',
  '--kol-green': '#00c46b',
  '--kol-green-light': '#4ade80',
  '--kol-red': '#ff4d4f',
  '--kol-text': '#ffffff',
  '--kol-text-secondary': '#cfcfcf',
  '--kol-text-tertiary': '#999999',
  '--kol-text-muted': '#888888',
  '--font-display': '"Clash Display"',
  '--font-body': '"Satoshi"',
}

function makeTheme(
  id: string,
  name: string,
  accent: string,
  overrides: Partial<Record<string, string>> = {}
): ThemeDefinition {
  const accentVars = generateAccentVariants(accent)
  return {
    id,
    name,
    accent,
    variables: {
      ...DARK_BASE,
      '--kol-blue': accentVars.blue,
      '--kol-blue-hover': accentVars.blueHover,
      '--kol-blue-glow': accentVars.blueGlow,
      ...overrides,
    },
  }
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'dark',
    name: 'Dark',
    accent: '#007bff',
    variables: { ...DARK_BASE },
  },
  makeTheme('light', 'Light', '#007bff', {
    '--kol-bg': '#f5f5f5',
    '--kol-surface': '#ffffff',
    '--kol-surface-elevated': '#f0f0f0',
    '--kol-border': '#e0e0e0',
    '--kol-border-hover': '#cccccc',
    '--kol-text': '#111111',
    '--kol-text-secondary': '#333333',
    '--kol-text-tertiary': '#666666',
    '--kol-text-muted': '#888888',
  }),
  makeTheme('dusk', 'Dusk', '#b47aff', {
    '--kol-bg': '#120e1a',
    '--kol-surface': '#1a1424',
    '--kol-surface-elevated': '#241c32',
    '--kol-border': '#342a48',
    '--kol-border-hover': '#443a58',
  }),
  makeTheme('astro', 'Astro', '#6366f1', {
    '--kol-bg': '#0a0a1a',
    '--kol-surface': '#0f0f28',
    '--kol-surface-elevated': '#181838',
    '--kol-border': '#252552',
    '--kol-border-hover': '#353568',
  }),
  makeTheme('neo', 'Neo', '#00ff88', {
    '--kol-bg': '#060d08',
    '--kol-surface': '#0a140c',
    '--kol-surface-elevated': '#121f16',
    '--kol-border': '#1a3020',
    '--kol-border-hover': '#244030',
  }),
  makeTheme('crimson', 'Crimson', '#ff3b5c', {
    '--kol-bg': '#0d0608',
    '--kol-surface': '#140a0c',
    '--kol-surface-elevated': '#1f1214',
    '--kol-border': '#301a1e',
    '--kol-border-hover': '#40242a',
  }),
  makeTheme('stealth', 'Stealth Blue', '#38bdf8', {
    '--kol-bg': '#080c10',
    '--kol-surface': '#0c1218',
    '--kol-surface-elevated': '#141c24',
    '--kol-border': '#1e2c38',
    '--kol-border-hover': '#283c4a',
  }),
  makeTheme('orange', 'Orange', '#f97316', {
    '--kol-bg': '#0d0a06',
    '--kol-surface': '#14100a',
    '--kol-surface-elevated': '#1f1810',
    '--kol-border': '#30241a',
    '--kol-border-hover': '#403024',
  }),
]

export function getThemeById(id: string): ThemeDefinition | undefined {
  return THEMES.find((t) => t.id === id)
}

export const CSS_VAR_KEYS = Object.keys(DARK_BASE)
