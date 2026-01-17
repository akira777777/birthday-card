/** @type {import('next').NextConfig} */

// Get repo name from environment for GitHub Pages base path
const isGithubPages = process.env.GITHUB_PAGES === 'true'
const repoName = process.env.REPO_NAME || 'birthday-card'
const basePath = isGithubPages ? `/${repoName}` : ''

const nextConfig = {
  // Environment variables available on client
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  // Enable static export for GitHub Pages
  output: isGithubPages ? 'export' : undefined,

  // Base path for GitHub Pages (e.g., /repo-name)
  basePath: isGithubPages ? `/${repoName}` : '',

  // Asset prefix for GitHub Pages
  assetPrefix: isGithubPages ? `/${repoName}/` : '',

  // Image configuration for PNG-based card
  images: {
    // Use unoptimized images for static export (GitHub Pages)
    unoptimized: isGithubPages,
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Image formats to use
    formats: ['image/webp', 'image/avif'],
    // Remote patterns (if needed)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Minimize image quality impact for PNG assets
    minimumCacheTTL: 31536000, // 1 year cache
  },

  // Optimize production builds
  swcMinify: true,

  // Compress responses
  compress: true,

  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Trailing slash for GitHub Pages compatibility
  trailingSlash: isGithubPages,

  // Experimental features for better performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['react', 'react-dom'],
  },

  // Compiler options for production
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/birthday-card/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
