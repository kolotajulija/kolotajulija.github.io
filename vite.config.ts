import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

// На GitHub Pages сайт живёт по адресу /<имя-репозитория>/,
// поэтому base подставляется на CI через переменную окружения BASE_PATH.
// Локально (npm run dev) остаётся '/'.
export default defineConfig({
  // версия и дата сборки подставляются в подвал сайта
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  base: process.env.BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
