import SponsorPage from '@/components/sponsor/sponsor-page';
import BreadcrumbJsonLd from '@/components/seo/breadcrumb-json-ld';
import JsonLdScript from '@/components/seo/json-ld-script';
import { sponsorMetadata, sponsorPricingPlans } from '@/data/sponsor-page';

const siteUrl = 'https://trustandsafetyindia.org';

export const metadata = sponsorMetadata;

export default function Page() {
  const sponsorJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/sponsor#webpage`,
    url: `${siteUrl}/sponsor`,
    name: 'Trust and Safety India Festival Sponsors and Partnerships',
    description: sponsorMetadata.description,
    about: [
      'Trust and Safety India Festival sponsorship',
      'TASI partnership',
      'online safety sponsorship India',
      'platform accountability sponsorship',
      'AI governance event sponsorship',
    ],
    mainEntity: {
      '@type': 'ItemList',
      name: 'TASI sponsorship opportunities',
      itemListElement: sponsorPricingPlans.map((plan, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: plan.name,
        description: plan.info,
      })),
    },
  };

  return (
    <>
      <JsonLdScript data={sponsorJsonLd} />
      <BreadcrumbJsonLd items={[{ name: 'Sponsors', url: '/sponsor' }]} />
      <SponsorPage />
    </>
  );
}
