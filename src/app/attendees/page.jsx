import AttendeesPage from '@/components/attendees/attendees-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { attendeesPageMetadata } from '@/data/attendees-page';

export const metadata = attendeesPageMetadata;

export const revalidate = 3600;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/attendees"
        name="Trust and Safety India Festival Attendees"
        description={attendeesPageMetadata.description}
        breadcrumbName="Attendees"
        about={[
          'TASI attendee directory',
          'Trust and Safety India Festival community',
          'trust and safety leaders',
          'platform policy attendees',
        ]}
      />
      <AttendeesPage />
    </>
  );
}
