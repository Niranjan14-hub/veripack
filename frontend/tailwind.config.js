/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#08080A',
        surface: '#0C0C0F',
        elevated: '#121216',
        line: '#1E1E24',
        'line-strong': '#2A2A32',
        ink: '#F4F4F6',
        muted: '#8B8B96',
        subtle: '#5F5F6B',
        accent: {
          DEFAULT: '#6E56CF',
          soft: '#8B75E8',
          dim: 'rgba(110,86,207,0.14)',
        },
        ok: { DEFAULT: '#30A46C', dim: 'rgba(48,164,108,0.14)' },
        warn: { DEFAULT: '#F5A524', dim: 'rgba(245,165,36,0.14)' },
        bad: { DEFAULT: '#E5484D', dim: 'rgba(229,72,77,0.14)' },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.8)',
        glow: '0 0 0 1px rgba(110,86,207,0.35), 0 12px 40px -12px rgba(110,86,207,0.5)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(110,86,207,0.45)' },
          '70%': { boxShadow: '0 0 0 12px rgba(110,86,207,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(110,86,207,0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
