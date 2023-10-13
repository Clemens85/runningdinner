import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  define: {
    "process.env": process.env
  },
  server: {
    port: 3000,
    https: true,
    proxy: {
      '/rest': {
        target: "https://localhost",
        secure: false,
        changeOrigin: true
      }
    }
  }
})
