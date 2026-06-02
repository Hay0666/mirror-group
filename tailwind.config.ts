import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0C0F',
        'slate-deep': '#111418',
        'slate-mid': '#1C2028',
        'slate-light': '#272D38',
        wire: '#3A424F',
        signal: '#FF6B2B',
        'signal-dim': '#7A3010',
        data: '#E2E8F0',
        ghost: '#64748B',
        success: '#22C55E',
        caution: '#EAB308',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'ui-label': ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
      },
      animation: {
        'pulse-signal': 'pulse-signal 2s ease-in-out infinite',
        'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
        'travelling-dot': 'travelling-dot 1.5s linear infinite',
        spin: 'spin 1s linear infinite',
      },
      keyframes: {
        'pulse-signal': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 107, 43, 0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(255, 107, 43, 0)' },
        },
        'slide-in-bottom': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'travelling-dot': {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      backgroundImage: {
        'grid-dots': 'radial-gradient(circle, #3A424F 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-dots': '24px 24px',
      },
    },
  },
  plugins: [],
}

export default config
