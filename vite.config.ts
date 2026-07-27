import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import UnoCSS from 'unocss/vite'
import svg from '@neodx/svg/vite';
import { analyzer } from 'vite-bundle-analyzer'

const config = {
  port: 5273
}

export default defineConfig(() => {
  return {
    plugins: [
      solid(),
      UnoCSS(),
      svg({
        inputRoot: 'assets/icons',
        output: 'public/sprites',
        fileName: '{name}.{hash:8}.svg',
        metadata: './src/shared/ui/icon/sprite.gen.ts'
      }),
      analyzer({
        enabled: true,
        analyzerMode: "static"
      })
    ],
    build: {
      sourcemap: true
    },
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
