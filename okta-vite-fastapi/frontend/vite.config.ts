import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use .env from parent directory (shared with backend)
  envDir: '..',
  server: {
    port: 8000,
  },
})
