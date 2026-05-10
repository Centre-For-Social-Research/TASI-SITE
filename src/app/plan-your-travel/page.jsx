import PlanTravelOverviewPage from '@/components/travel/plan-travel-overview-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { travelOverviewMetadata } from '@/data/plan-your-travel-page';

export const metadata = travelOverviewMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/plan-your-travel"
        name="Plan Travel for Trust and Safety India Festival"
        description={travelOverviewMetadata.description}
        breadcrumbName="Plan Your Travel"
        about={[
          'TASI travel',
          'Trust and Safety India Festival venue',
          'New Delhi conference travel',
          'TASI hotels and visa information',
        ]}
      />
      <PlanTravelOverviewPage />
    </>
  );
}
