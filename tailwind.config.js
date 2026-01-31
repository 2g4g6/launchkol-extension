/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        'usd1': '#EAAC08',
        'kol': {
          'bg': 'var(--kol-bg)',
          'surface': 'var(--kol-surface)',
          'surface-elevated': 'var(--kol-surface-elevated)',
          'border': 'var(--kol-border)',
          'border-hover': 'var(--kol-border-hover)',
          'blue': 'var(--kol-blue)',
          'blue-hover': 'var(--kol-blue-hover)',
          'blue-glow': 'var(--kol-blue-glow)',
          'green': 'var(--kol-green)',
          'green-light': 'var(--kol-green-light)',
          'red': 'var(--kol-red)',
          'text': 'var(--kol-text)',
          'text-secondary': 'var(--kol-text-secondary)',
          'text-tertiary': 'var(--kol-text-tertiary)',
          'text-muted': 'var(--kol-text-muted)',
        },
      },
      fontFamily: {
        'display': ['var(--font-display)', 'system-ui', 'sans-serif'],
        'body': ['var(--font-body)', 'system-ui', 'sans-serif'],
        'mono': ['"IBM Plex Mono"', 'monospace'],
        // Auth screen fonts (original)
        'auth-display': ['"Sora"', 'system-ui', 'sans-serif'],
        'auth-body': ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px var(--kol-blue-glow)' },
          '50%': { boxShadow: '0 0 40px var(--kol-blue-glow)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
