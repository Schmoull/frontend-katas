import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      clientPort: Number(process.env.VITE_HMR_CLIENT_PORT) || 5173,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
})
