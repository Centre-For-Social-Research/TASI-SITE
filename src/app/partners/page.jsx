import PartnersPage from '@/components/partners/partners-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { partnersPageMetadata } from '@/data/partners-page';

export const metadata = partnersPageMetadata;

export default function Page() {
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
      <PartnersPage />
    </>
  );
}
