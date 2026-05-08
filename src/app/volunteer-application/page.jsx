import VolunteerApplicationPage from '@/components/volunteers/volunteer-application-page';
import { volunteerApplicationMetadata } from '@/data/volunteer-application-page';

export const metadata = volunteerApplicationMetadata;

export default function Page() {
  return <VolunteerApplicationPage />;
}
