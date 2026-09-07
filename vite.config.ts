import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the built site works from any path once it is finished
// inside GHL AI Studio. Do not change this to '/'.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Keep three.js in its own chunk so it never blocks first paint.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('@react-three')) return 'three-react'
          return undefined
        },
      },
    },
  },
})
