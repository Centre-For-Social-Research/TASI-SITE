import AccommodationPage from '@/components/travel/accommodation-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { accommodationMetadata } from '@/data/plan-your-travel-page';

export const metadata = accommodationMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/plan-your-travel/accommodation"
        name="Accommodation for Trust and Safety India Festival"
        description={accommodationMetadata.description}
        breadcrumbName="Accommodation"
        about={['TASI hotels', 'New Delhi conference accommodation']}
      />
      <AccommodationPage />
    </>
  );
}
