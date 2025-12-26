import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 3030,
    strictPort: true,
  },
  server: {
    port: 3030,
    host: true,
    strictPort: true,
    origin: "http://0.0.0.0:3030",
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:82",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
