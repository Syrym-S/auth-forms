import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  define: {
    "import.meta.env.VITE_AUTH_ROLE": JSON.stringify("forwarder"),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },

  build: {
    outDir: "dist/assets/js/forwarder",
    cssCodeSplit: false,
    lib: {
      entry: "src/main.jsx",
      formats: ["iife"],
      name: "ForwarderApp",
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
