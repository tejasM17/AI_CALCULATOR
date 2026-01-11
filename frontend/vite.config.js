import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:{
    port:3000,
    proxy: {
      // All requests starting with /api go to backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false, // if you ever use https locally
        // Optional: rewrite if your backend routes don't start with /api
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
