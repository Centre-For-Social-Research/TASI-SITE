import JsonLdScript from './json-ld-script';

const SITE_URL = 'https://trustandsafetyindia.org';

export default function BreadcrumbJsonLd({ items = [] }) {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    ...items.map((item) => ({
      name: item.name,
      url: item.url?.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  ];

  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
