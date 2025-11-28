import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PORT: "3030",
  },
  // Keep compiled pages in memory longer to speed up re-navigation
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minute (default 25s)
    pagesBufferLength: 10, // Keep 10 pages cached (default 2)
  },
  experimental: {
    // Package import optimization - explicitly list all heavy libraries
    optimizePackageImports: [
      // Icon libraries (biggest impact - 7,800+ files reduced to ~100)
      "@tabler/icons-react",
      "lucide-react",
      // Date utilities (1,400+ files)
      "date-fns",
      // UI components
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
      // Data libraries
      "@tanstack/react-table",
      "recharts",
      // Animation
      "framer-motion",
    ],
    // Static generation optimizations
    staticGenerationRetryCount: 1,
    staticGenerationMaxConcurrency: 8,
    staticGenerationMinPagesPerWorker: 25,
  },
  // NOTE: Webpack config removed - Turbopack is now default and handles optimization automatically
  // If you need webpack, run: next dev --webpack or next build --webpack
  // Turbopack provides 2-5x faster compilation without manual config
  output: "standalone",
};

export default nextConfig;
