import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        accent: 'var(--color-accent)',
        conflict: 'var(--color-conflict)',
      },
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Display', 'Inter', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        panel: 'var(--radius-panel)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      boxShadow: {
        card: '0 24px 80px rgba(29, 29, 31, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
