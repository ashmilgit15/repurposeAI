import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */


  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },



  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Experimental features for better performance
  experimental: {

    optimizePackageImports: ['lucide-react', '@/components/ui', 'sonner'],
    // Optimize CSS imports
    optimizeCss: true,
    // Faster server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Development optimizations
  // ...(process.env.NODE_ENV === 'development' && {
  //   // Faster dev server
  //   devIndicators: {
  //     appIsrStatus: false,
  //   },
  // }),
};

export default nextConfig;
