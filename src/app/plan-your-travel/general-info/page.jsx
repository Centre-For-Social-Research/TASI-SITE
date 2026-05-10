import GeneralInfoPage from '@/components/travel/general-info-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { generalInfoMetadata } from '@/data/plan-your-travel-page';

export const metadata = generalInfoMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/plan-your-travel/general-info"
        name="General Information for TASI 2026 Travel"
        description={generalInfoMetadata.description}
        breadcrumbName="General Info"
        about={['TASI travel information', 'New Delhi delegate tips']}
      />
      <GeneralInfoPage />
    </>
  );
}
