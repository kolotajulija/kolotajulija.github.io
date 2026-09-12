import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

const { version } = JSON.parse(readFileSync('./version.json', 'utf8'))

// На GitHub Pages сайт живёт по адресу /<имя-репозитория>/,
// поэтому base подставляется на CI через переменную окружения BASE_PATH.
// Локально (npm run dev) остаётся '/'.
export default defineConfig({
  // версия подставляется в подвал сайта: дата и номер выкладки за этот день
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  base: process.env.BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
