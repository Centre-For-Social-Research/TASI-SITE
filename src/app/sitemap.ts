import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://jamsaq.in',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://jamsaq.in/about',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://jamsaq.in/speakers',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://jamsaq.in/editions',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://jamsaq.in/register',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://jamsaq.in/sponsor',
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}
