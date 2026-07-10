import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  define: {
    'import.meta.env.VITE_AUTH_ROLE': JSON.stringify('factor'),
    'process.env.NODE_ENV': JSON.stringify('production'),
  },

  build: {
    outDir: "dist/assets/js/factor",
    cssCodeSplit: false,
    lib: {
      entry: 'src/main.jsx',
      formats: ['iife'],
      name: 'FactorApp',
      fileName: () => 'index.js',
      cssFileName: 'index',
    },
    rollupOptions: {
      // input: resolve(__dirname, "index.factor.html"),
    },
  },
  server: {
    open: '/index.factor.html',
  },
});
