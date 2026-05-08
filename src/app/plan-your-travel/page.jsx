import PlanTravelOverviewPage from '@/components/travel/plan-travel-overview-page';
import { travelOverviewMetadata } from '@/data/plan-your-travel-page';

export const metadata = travelOverviewMetadata;

export default function Page() {
  return <PlanTravelOverviewPage />;
}
