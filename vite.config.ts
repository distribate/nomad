import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import UnoCSS from 'unocss/vite'
import svg from '@neodx/svg/vite';
import { analyzer } from 'vite-bundle-analyzer'
import { exposeMacro } from "./plugins/expose-macro.ts"
import devtools from 'solid-devtools/vite'
import fs from 'fs'

const config = {
  port: 5273
}

export default defineConfig(() => {
  return {
    plugins: [
      devtools({
        autoname: true,
      }),
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
      }),
      exposeMacro()
    ],
    build: {
      sourcemap: true,
      minify: true
    },
    server: {
      host: true,
      port: config.port,
      https: {
        cert: fs.readFileSync('./certs/127.0.0.1.pem'),
        key: fs.readFileSync('./certs/127.0.0.1-key.pem')
      }
    },
    preview: {
      host: true,
      port: config.port,
    }
  }
})
