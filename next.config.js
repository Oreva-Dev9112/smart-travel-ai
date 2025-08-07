/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['images.unsplash.com', 'source.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Optimize bundle size
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Enable gzip compression
  compress: true,
  
  // Optimize fonts
  optimizeFonts: true,
  
  // Experimental features
  experimental: {
    // Enable server components where applicable
 
    optimizeCss: true,
    // Optimize package imports
    optimizePackageImports: [
      'framer-motion', 
      '@heroicons/react', 
      'date-fns', 
      'lucide-react',
      'react-markdown'
    ],
  },
  
  // Transpile specific modules
  transpilePackages: ['@heroicons/react', 'lucide-react'],
  
  // Increase build cache size
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
