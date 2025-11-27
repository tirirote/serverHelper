import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 3001
  },
  proxy: {
    '/api': {
      target: 'http://localhost:3000', // Apunta a tu backend
      changeOrigin: true,
      secure: false,
    }
  }
})
