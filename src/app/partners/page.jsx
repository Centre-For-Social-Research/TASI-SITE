import PartnersPage from '@/components/partners/partners-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { partnersPageMetadata } from '@/data/partners-page';

export const metadata = partnersPageMetadata;

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialYear = resolvedSearchParams?.year === '2025' ? '2025' : '2026';

  return (
    <>
      <PageSeoJsonLd
        path="/partners"
        name="Trust and Safety India Festival Partners"
        description={partnersPageMetadata.description}
        breadcrumbName="Partners"
        about={[
          'TASI partners',
          'Trust and Safety India Festival sponsors',
          'platform safety organizations',
          'digital safety partners India',
        ]}
      />
      <PartnersPage initialYear={initialYear} />
    </>
  );
}
