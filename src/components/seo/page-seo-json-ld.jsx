import BreadcrumbJsonLd from './breadcrumb-json-ld';
import JsonLdScript from './json-ld-script';

const SITE_URL = 'https://trustandsafetyindia.org';

export default function PageSeoJsonLd({
  path,
  name,
  description,
  breadcrumbName,
  about = [],
}) {
  const url = `${SITE_URL}${path}`;

  return (
    <>
      <JsonLdScript
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name,
          description,
          isPartOf: {
            '@id': `${SITE_URL}/#website`,
          },
          about,
        }}
      />
      <BreadcrumbJsonLd items={[{ name: breadcrumbName || name, url: path }]} />
    </>
  );
}
