import AccommodationPage from '@/components/travel/accommodation-page';
import { accommodationMetadata } from '@/data/plan-your-travel-page';

export const metadata = accommodationMetadata;

export default function Page() {
  return <AccommodationPage />;
}
