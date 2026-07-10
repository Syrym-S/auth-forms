import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  define: {
      'import.meta.env.VITE_AUTH_ROLE': JSON.stringify('admin'),
      'process.env.NODE_ENV': JSON.stringify('production'),
  },

  build: {
    outDir: "dist/assets/js/admin",
    cssCodeSplit: false,
    lib: {
      entry: "src/main.jsx",
      formats: ["iife"],
      name: "AdminApp",
      fileName: () => "index.js",
      cssFileName: "index",
    },
    rollupOptions: {
      // input: resolve(__dirname, "index.admin.html"),
    },
  },
  server: {
    open: "index.admin.html",
  },
});
