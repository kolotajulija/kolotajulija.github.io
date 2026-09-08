import { defineConfig } from 'vite'

// На GitHub Pages сайт живёт по адресу /<имя-репозитория>/,
// поэтому base подставляется на CI через переменную окружения BASE_PATH.
// Локально (npm run dev) остаётся '/'.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
