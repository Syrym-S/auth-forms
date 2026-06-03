import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/driver',
    rollupOptions: {
      input: resolve(__dirname, 'index.driver.html'),
    },
  },
  server:{
    open: '/index.driver.html'
  }
});