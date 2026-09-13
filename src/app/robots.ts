import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.brandxpere.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/agency',
          '/pricing',
          '/templates',
          '/contact',
          '/help',
          '/faq',
          '/c/*',
          '/_next/static/*',
          '/brandxpere-*',
          '/favicon.png',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/onboarding',
          '/checkout/confirm',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
