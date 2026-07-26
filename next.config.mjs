/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: '/post', destination: '/blog', permanent: true },
      { source: '/post/:slug*', destination: '/blog/:slug*', permanent: true },
      {
        source: '/ai-workflow-automation',
        destination: '/ai-workflow-and-business-process-automation',
        permanent: true,
      },
      {
        source: '/business-process-automation',
        destination: '/ai-workflow-and-business-process-automation',
        permanent: true,
      },
      {
        source: '/enterprise-excel-applications',
        destination: '/enterprise',
        permanent: true,
      },
      {
        source: '/enterprise-excel-vba-development',
        destination: '/enterprise',
        permanent: true,
      },
      {
        source: '/excel-vba-development',
        destination: '/excel-vba-macro-development',
        permanent: true,
      },
      {
        source: '/excel-macro-automation',
        destination: '/excel-vba-macro-development',
        permanent: true,
      },
      {
        source: '/excel-sql-integration',
        destination: '/excel-integrations',
        permanent: true,
      },
      {
        source: '/solutions/spreadsheet-process-modernisation',
        destination: '/ai-workflow-and-business-process-automation',
        permanent: true,
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'xlsexperts-49c22.firebasestorage.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
        pathname: '/media/**',
      },
    ],
  },
}

export default nextConfig
