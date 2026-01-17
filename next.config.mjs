/** @type {import('next').NextConfig */

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

  images: {
    // Use unoptimized images for static export
    unoptimized: isGithubPages,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Optimize production builds
  swcMinify: true,

  // Compress responses
  compress: true,

  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Trailing slash for GitHub Pages compatibility
  trailingSlash: isGithubPages,

  // Performance optimizations
  poweredByHeader: false,
  
  // Compiler options for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
