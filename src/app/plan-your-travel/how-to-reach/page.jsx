import HowToReachPage from '@/components/travel/how-to-reach-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { howToReachMetadata } from '@/data/plan-your-travel-page';

export const metadata = howToReachMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/plan-your-travel/how-to-reach"
        name="How to Reach Trust and Safety India Festival"
        description={howToReachMetadata.description}
        breadcrumbName="How to Reach"
        about={['TASI venue travel', 'New Delhi airport metro taxi']}
      />
      <HowToReachPage />
    </>
  );
}
