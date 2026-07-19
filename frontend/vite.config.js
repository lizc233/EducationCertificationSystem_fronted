import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const backendTarget = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true
      },
      '/notice': {
        target: backendTarget,
        changeOrigin: true
      }
    }
  }
});
