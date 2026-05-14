export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/studio/',
          '/api/',
          '/not-authorized/',
          '/sign-in',
          '/sign-up',
          '/opengraph-image',
          '/twitter-image',
        ],
      },
    ],
    sitemap: 'https://trustandsafetyindia.org/sitemap.xml',
    host: 'https://trustandsafetyindia.org',
  };
}
