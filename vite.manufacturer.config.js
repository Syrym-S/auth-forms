import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: "/js/auth/",
  plugins: [react()],

  define: {
    "import.meta.env.VITE_AUTH_ROLE": JSON.stringify("manufacturer"),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },

  build: {
    outDir: "dist/assets/js/manufacturer",
    cssCodeSplit: false,
    lib: {
      entry: "src/main.jsx",
      formats: ["iife"],
      name: "ManufacturerApp",
      fileName: () => "index.js",
      cssFileName: "index",
    },
  },
  server: {
    open: "/index.manufacturer.html",
  },
});
