import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/retail_app/', // Must match your repo name
  build: {
    outDir: 'dist'
  }
})
