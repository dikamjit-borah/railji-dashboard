import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Rail navy palette — the primary brand color
        rail: {
          50: '#EEF4FF',
          100: '#E0EBFF',
          200: '#B8D0FF',
          300: '#85AFFF',
          400: '#4D86F5',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E3E8C',
          800: '#1A3070',
          900: '#162254',
          950: '#0F1A3E',
        },
        // Warm ivory backgrounds and surfaces
        warm: {
          50: '#FAFAF7',
          100: '#F5F3EE',
          200: '#EDE9E0',
          300: '#E0D9CC',
          400: '#C8BFA8',
          500: '#A89880',
          600: '#8A7A60',
          700: '#6B5E48',
          800: '#4D4333',
          900: '#352E22',
        },
        // Amber accent — railway lantern gold
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'Syne', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        'gutter': '1.5rem',
        'gutter-sm': '1rem',
        'track': '0.125rem',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'shimmer': 'shimmer 1.8s infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(22, 34, 84, 0.07), 0 1px 2px -1px rgba(22, 34, 84, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(22, 34, 84, 0.12), 0 2px 6px -2px rgba(22, 34, 84, 0.08)',
        'sidebar': '4px 0 32px rgba(15, 26, 62, 0.18)',
        'topnav': '0 1px 0 0 rgba(22, 34, 84, 0.06)',
        'palette': '0 24px 64px -12px rgba(15, 26, 62, 0.25), 0 8px 24px -8px rgba(15, 26, 62, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config
