import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works under GitHub Pages' /valentines/ subpath
  base: './',
  plugins: [react()],
})
