import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: process.env.NODE_ENV === 'production' ? true : false,
    cors: true,
    port: process.env.NODE_ENV === 'production' ? 8080 : 3000,
    host: true
  },
  preview: {
    https: true,
    cors: true,
    port: 8080
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})