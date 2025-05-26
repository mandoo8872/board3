import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/board3/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  cacheDir: 'node_modules/.vite-cache', // 기존 캐시 무력화
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
