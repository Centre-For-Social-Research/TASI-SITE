const routes = [
  '',
  '/about',
  '/themes',
  '/speakers',
  '/register',
  '/sponsor',
  '/contact',
  '/media',
  '/media/press-kit',
  '/media/press-releases',
  '/past-editions',
  '/tasi-2025',
  '/tasi-2026',
  '/get-involved',
  '/volunteer-application',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-settings',
];

export default function sitemap() {
  const baseUrl = 'https://jamsaq.in';

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
