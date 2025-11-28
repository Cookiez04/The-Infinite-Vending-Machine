import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded correctly on relative paths (e.g. GitHub Pages)
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
          'rapier-vendor': ['@react-three/rapier', '@dimforge/rapier3d-compat'],
          'drei-vendor': ['@react-three/drei'],
          'postprocessing-vendor': ['@react-three/postprocessing', 'postprocessing'],
        },
      },
    },
  },
})
