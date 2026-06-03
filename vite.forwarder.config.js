import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/forwarder',
    rollupOptions: {
      input: resolve(__dirname, 'index.forwarder.html'),
    }
  },
  server:{
    open: 'index.forwarder.html'
  }
});