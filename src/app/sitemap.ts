import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.brandxpere.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/agency`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const profiles = await db.profile.findMany({
      where: {
        isPublic: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      take: 2000,
    });

    profileRoutes = profiles
      .filter((p) => Boolean(p.slug))
      .map((p) => ({
        url: `${baseUrl}/c/${p.slug}`,
        lastModified: p.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.error('[Sitemap] Failed to fetch dynamic profiles:', err);
  }

  return [...staticRoutes, ...profileRoutes];
}
