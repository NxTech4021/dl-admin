import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PORT: "3030",
  },
  experimental: {
    // STANDARD: Package import optimization - works for both dev and production
    optimizePackageImports: [
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@tabler/icons-react",
      "@tanstack/react-table",
      "lucide-react",
      "recharts",
    ],
    // STANDARD: Static generation optimizations
    staticGenerationRetryCount: 1,
    staticGenerationMaxConcurrency: 8,
    staticGenerationMinPagesPerWorker: 25,
  },
  // STANDARD: Webpack optimizations that work for both dev and production
  webpack: (config, { dev, isServer }) => {
    // Enable polling for Docker hot reload
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    // Apply optimizations for both development and production
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 20000, // 20KB minimum chunk size
          maxSize: dev ? 244000 : 500000, // Smaller chunks in dev, larger in prod
          cacheGroups: {
            // Core framework - highest priority
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: "framework",
              chunks: "all",
              priority: 40,
              enforce: true,
            },
            // UI Components - high priority
            ui: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: "ui-components",
              chunks: "all",
              priority: 30,
            },
            // Charts and visualization libraries
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3|d3-)[\\/]/,
              name: "charts",
              chunks: "all",
              priority: 25,
            },
            // Data tables
            tables: {
              test: /[\\/]node_modules[\\/]@tanstack[\\/]react-table[\\/]/,
              name: "tables",
              chunks: "all",
              priority: 25,
            },
            // Icon libraries
            icons: {
              test: /[\\/]node_modules[\\/](@tabler[\\/]icons-react|lucide-react)[\\/]/,
              name: "icons",
              chunks: "all",
              priority: 20,
            },
            // Other vendors
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
          },
        },
      };
    }

    // Development-specific optimizations
    if (dev) {
      config.cache = {
        type: "memory",
        maxGenerations: 1,
      };
    }

    return config;
  },
  output: "standalone",
};

export default nextConfig;
