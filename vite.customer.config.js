import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/customer',
    rollupOptions: {
      input: resolve(__dirname, 'index.customer.html'),
    },
  },
  server:{
    open: '/index.customer.html'
  }
});