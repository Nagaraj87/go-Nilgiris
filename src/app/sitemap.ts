import { MetadataRoute } from 'next';
import { getTourPackages } from '@/lib/firebase';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gonilgiris.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tourPackages = await getTourPackages();

  const tourUrls = tourPackages.map((tour) => ({
    url: `${baseUrl}/tours/${tour.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...tourUrls,
  ];
}
