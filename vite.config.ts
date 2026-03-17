/// <reference types="vitest" />
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
    port: 3032,
    strictPort: true,
  },
  server: {
    port: 3032,
    host: true,
    strictPort: true,
    origin: "http://0.0.0.0:3032",
    hmr: {
      host: "localhost",
      port: 3032,
      clientPort: 3032,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": {
        // VITE_PROXY_TARGET is set in Docker for internal network, falls back to localhost:82
        target: process.env.VITE_PROXY_TARGET || "http://localhost:82",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
    css: true,
    exclude: [
      "node_modules/**",
      "dist/**",
      "e2e/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/components/ui/",
        "src/__tests__/",
      ],
    },
  },
});