/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kol': {
          'bg': '#0a0a0a',
          'surface': '#101010',
          'surface-elevated': '#1a1a1a',
          'border': '#2a2a2a',
          'border-hover': '#3a3a3a',
          'blue': '#007bff',
          'blue-hover': '#3390ff',
          'blue-glow': 'rgba(0, 123, 255, 0.4)',
          'green': '#00c46b',
          'red': '#ff4d4f',
          'text': '#ffffff',
          'text-secondary': '#cfcfcf',
          'text-tertiary': '#888888',
          'text-muted': '#666666',
        },
      },
      fontFamily: {
        'display': ['"Clash Display"', 'system-ui', 'sans-serif'],
        'body': ['"Satoshi"', 'system-ui', 'sans-serif'],
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 123, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 123, 255, 0.6)' },
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
