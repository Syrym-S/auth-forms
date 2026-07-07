import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  define: {
    "import.meta.env.VITE_AUTH_ROLE": JSON.stringify("customer"),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },

  build: {
    outDir: "dist/assets/js/customer",
    cssCodeSplit: false,
    lib: {
      entry: "src/main.jsx",
      formats: ["iife"],
      name: "CustomerApp",
      fileName: () => "index.js",
      cssFileName: "index",
    },
    rollupOptions: {
      // input: resolve(__dirname, "index.customer.html"),
    },
  },
  server: {
    open: "/index.customer.html",
  },
});
