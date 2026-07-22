import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import UnoCSS from 'unocss/vite'

const config = {
  port: 5273
}

export default defineConfig(() => {
  return {
    plugins: [
      solid(),
      UnoCSS(),
    ],
    server: {
      host: true,
      port: config.port,
    },
    preview: {
      host: true,
      port: config.port,
    }
  }
})
