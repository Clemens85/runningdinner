import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  define: {
    'process.env': process.env,
  },
  server: {
    port: 3000,
    // https: true,
    proxy: {
      '/rest': {
        target: 'http://localhost:9090',
        secure: false,
        changeOrigin: true,
      },
      '/sse': {
        target: 'http://localhost:9090',
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
