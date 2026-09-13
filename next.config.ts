import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
