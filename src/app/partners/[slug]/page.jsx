import { notFound } from 'next/navigation';
import PartnerDetailPage from '@/components/partners/partner-detail-page';
import BreadcrumbJsonLd from '@/components/seo/breadcrumb-json-ld';
import JsonLdScript from '@/components/seo/json-ld-script';
import {
  getPartnerBySlug,
  getPartnerMetadata,
  getPartnerStaticParams,
} from '@/data/partners-page';

const SITE_URL = 'https://trustandsafetyindia.org';

export function generateStaticParams() {
  return getPartnerStaticParams();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return getPartnerMetadata(slug);
}

export default async function Page({ params }) {
  const { slug } = await params;
  const partner = getPartnerBySlug(slug);

  if (!partner) notFound();

  const pageUrl = `${SITE_URL}/partners/${partner.slug}`;
  const sameAs = Object.values(partner.social || {}).filter(Boolean);
  const partnerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${pageUrl}#organization`,
    name: partner.name,
    description: partner.description,
    url: partner.website || pageUrl,
    logo: partner.logo ? `${SITE_URL}${partner.logo}` : undefined,
    sameAs,
    location: partner.country
      ? {
          '@type': 'Country',
          name: partner.country,
        }
      : undefined,
    memberOf: {
      '@type': 'Event',
      name: 'Trust and Safety India Festival',
      url: SITE_URL,
    },
    keywords: [
      partner.name,
      partner.type,
      partner.category,
      partner.country,
      'Trust and Safety India Festival partner',
      'TASI partner',
    ]
      .filter(Boolean)
      .join(', '),
  };

  return (
    <>
      <JsonLdScript data={partnerJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Partners', url: '/partners' },
          { name: partner.name, url: `/partners/${partner.slug}` },
        ]}
      />
      <PartnerDetailPage partner={partner} />
    </>
  );
}
