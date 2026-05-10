import VolunteerApplicationPage from '@/components/volunteers/volunteer-application-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { volunteerApplicationMetadata } from '@/data/volunteer-application-page';

export const metadata = volunteerApplicationMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/volunteer-application"
        name="Volunteer at Trust and Safety India Festival"
        description={volunteerApplicationMetadata.description}
        breadcrumbName="Volunteer Application"
        about={[
          'TASI volunteer',
          'Trust and Safety India Festival volunteer',
          'event volunteer India',
          'online safety conference volunteer',
        ]}
      />
      <VolunteerApplicationPage />
    </>
  );
}
