import { MetadataRoute } from 'next';

const BASE = 'https://jamsaq.in';

const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '',                               changeFrequency: 'weekly',  priority: 1.0 },
  { path: '/about',                         changeFrequency: 'monthly', priority: 0.8 },
  { path: '/themes',                        changeFrequency: 'monthly', priority: 0.8 },
  { path: '/speakers',                      changeFrequency: 'weekly',  priority: 0.8 },
  { path: '/programme',                     changeFrequency: 'weekly',  priority: 0.8 },
  { path: '/register',                      changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/sponsor',                       changeFrequency: 'monthly', priority: 0.7 },
  { path: '/get-involved',                  changeFrequency: 'monthly', priority: 0.7 },
  { path: '/speaker-application',           changeFrequency: 'monthly', priority: 0.7 },
  { path: '/volunteer-application',         changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact',                       changeFrequency: 'monthly', priority: 0.6 },
  { path: '/media',                         changeFrequency: 'monthly', priority: 0.7 },
  { path: '/media/press-kit',               changeFrequency: 'monthly', priority: 0.6 },
  { path: '/media/press-releases',          changeFrequency: 'weekly',  priority: 0.6 },
  { path: '/blog',                          changeFrequency: 'weekly',  priority: 0.7 },
  { path: '/plan-your-travel',              changeFrequency: 'monthly', priority: 0.7 },
  { path: '/plan-your-travel/general-info', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/plan-your-travel/how-to-reach', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/plan-your-travel/visa-information', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/plan-your-travel/accommodation',changeFrequency: 'monthly', priority: 0.6 },
  { path: '/past-editions',                 changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tasi-2025',                     changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tasi-2026',                     changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy-policy',                changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/terms-of-service',              changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/cookie-settings',               changeFrequency: 'yearly',  priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
