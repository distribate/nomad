import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'
import presetAnimations from "unocss-preset-animations";

export default defineConfig({
  presets: [
    presetWind4(),
    presetAnimations()
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
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
        "accordion-down":
          "{ from { height: 0 } to { height: var(--kb-accordion-content-height) } }",
        "accordion-up": "{ from { height: var(--kb-accordion-content-height) } to { height: 0 } }",
        "collapsible-down":
          "{ from { height: 0 } to { height: var(--kb-collapsible-content-height) } }",
        "collapsible-up":
          "{ from { height: var(--kb-collapsible-content-height) } to { height: 0 } }"
      },
      durations: {
        'pulse-fade': '2.5s',
        shimmer: '1.8s',
        "accordion-down": "0.2s",
        "accordion-up": "0.2s",
        "collapsible-down": "0.2s",
        "collapsible-up": "0.2s"
      },
      counts: {
        'pulse-fade': 'infinite',
        shimmer: 'infinite',
      },
      timingFns: {
        'pulse-fade': 'ease-in-out',
        shimmer: 'linear',
        "accordion-down": "ease-out",
        "accordion-up": "ease-out",
        "collapsible-down": "ease-out",
        "collapsible-up": "ease-out"
      },
    },
  },
})
