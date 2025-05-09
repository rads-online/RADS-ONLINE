<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000
  }
})
=======
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
]
}
}
});
>>>>>>> 68c1a5994d89b67bd8b5cacd41d6cab8993c08b0
