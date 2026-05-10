import GetInvolvedPage from '@/components/get-involved/get-involved-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { getInvolvedMetadata } from '@/data/get-involved-page';

export const metadata = getInvolvedMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/get-involved"
        name="Get Involved With Trust and Safety India Festival"
        description={getInvolvedMetadata.description}
        breadcrumbName="Get Involved"
        about={[
          'TASI sponsorship',
          'TASI speakers',
          'TASI volunteers',
          'TASI media partners',
          'Trust and Safety India Festival participation',
        ]}
      />
      <GetInvolvedPage />
    </>
  );
}
