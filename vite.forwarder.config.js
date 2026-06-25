import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  define: {
      'import.meta.env.VITE_AUTH_ROLE': JSON.stringify('forwarder'),
      'process.env.NODE_ENV': JSON.stringify('production'),
  },

  build: {
    outDir: "dist/forwarder/assets",
    cssCodeSplit: false,
    lib: {
      entry: "src/main.jsx",
      formats: ["iife"],
      name: "DriverApp",
      fileName: () => "index.js",
      cssFileName: "index",
    },
    rollupOptions: {
      // input: resolve(__dirname, "index.forwarder.html"),
    },
  },
  server: {
    open: "index.forwarder.html",
  },
});
