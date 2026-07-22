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
  },
})
