import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { defineConfig, loadEnv } from 'vite'
import solid from 'vite-plugin-solid'
import UnoCSS from 'unocss/vite'
import svg from '@neodx/svg/vite';
import { analyzer } from 'vite-bundle-analyzer'
import { exposeMacro } from "./plugins/expose-macro.ts"
import devtools from 'solid-devtools/vite'
import fs from 'fs'
import { VitePWA } from 'vite-plugin-pwa'

const config = {
  port: 5273
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // check the certs folder with certs before enabling HTTPS
  const withHttps = env["VITE_WITH_HTTPS"] === 'true';

  return {
    plugins: [
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
        strategy: ["localStorage", "preferredLanguage", "baseLocale"]
      }),
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
      exposeMacro(),
      VitePWA({
        registerType: 'autoUpdate'
      })
    ],
    build: {
      sourcemap: true,
      minify: true
    },
    server: {
      host: true,
      port: config.port,
      ...(withHttps && {
        https: {
          cert: fs.readFileSync('./certs/127.0.0.1.pem'),
          key: fs.readFileSync('./certs/127.0.0.1-key.pem')
        }
      }),
    },
    preview: {
      host: true,
      port: config.port,
    }
  }
})
