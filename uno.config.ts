import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
  ],
  theme: {
    colors: {
      primary: 'var(--neutral-50)',
      'primary-foreground': 'var(--neutral-900)',
      'brand-default': 'var(--brand-default)',
    },
    animation: {
      keyframes: {
        'pulse-fade': `{
              '0%, 100%': { opacity: '0.35' },
              '50%': { opacity: '0.85' }
            }`,
        shimmer: `{
              '100%': { transform: 'translateX(100%)' }
            }`,
      },
      durations: {
        'pulse-fade': '2.5s',
        shimmer: '1.8s',
      },
      counts: {
        'pulse-fade': 'infinite',
        shimmer: 'infinite',
      },
      timingFns: {
        'pulse-fade': 'ease-in-out',
        shimmer: 'linear',
      },
    },
  },
})
