import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**': ['./prisma/dev.db'],
  },
  async redirects() {
    return [
      // Legacy WordPress URLs cleanup & 301 redirection
      {
        source: '/advertising',
        destination: '/agency',
        permanent: true,
      },
      {
        source: '/advertising/:path*',
        destination: '/agency',
        permanent: true,
      },
      {
        source: '/case-studies',
        destination: '/agency',
        permanent: true,
      },
      {
        source: '/expertise',
        destination: '/agency',
        permanent: true,
      },
      {
        source: '/printing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/printing/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/marketplace',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/agency',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/agency',
        permanent: true,
      },
      {
        source: '/sample-page',
        destination: '/',
        permanent: true,
      },
      {
        source: '/hello-world',
        destination: '/',
        permanent: true,
      },
      {
        source: '/hello-world/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/my-blog',
        destination: '/',
        permanent: true,
      },
      {
        source: '/my-blog/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-admin/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-login.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/xmlrpc.php',
        destination: '/',
        permanent: true,
      },
    ];
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/(brandxpere-.*|favicon.png|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
