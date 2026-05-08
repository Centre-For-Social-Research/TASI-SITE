import GeneralInfoPage from '@/components/travel/general-info-page';
import { generalInfoMetadata } from '@/data/plan-your-travel-page';

export const metadata = generalInfoMetadata;

export default function Page() {
  return <GeneralInfoPage />;
}
