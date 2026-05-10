import VisaInformationPage from '@/components/travel/visa-information-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { visaInformationMetadata } from '@/data/plan-your-travel-page';

export const metadata = visaInformationMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/plan-your-travel/visa-information"
        name="Visa Information for Trust and Safety India Festival"
        description={visaInformationMetadata.description}
        breadcrumbName="Visa Information"
        about={['TASI visa information', 'India conference visa']}
      />
      <VisaInformationPage />
    </>
  );
}
