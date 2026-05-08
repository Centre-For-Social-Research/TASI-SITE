import AttendeesPage from '@/components/attendees/attendees-page';
import { attendeesPageMetadata } from '@/data/attendees-page';

export const metadata = attendeesPageMetadata;

export const revalidate = 3600;

export default function Page() {
  return <AttendeesPage />;
}
