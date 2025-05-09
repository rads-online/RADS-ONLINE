import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/analytics',
        'firebase/storage'
      ],
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000
  }
})
