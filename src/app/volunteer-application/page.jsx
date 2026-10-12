import { isFormOpen } from '@/lib/form-settings';
import VolunteerApplicationPage from '@/components/volunteers/volunteer-application-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { volunteerApplicationMetadata } from '@/data/volunteer-application-page';

export const metadata = volunteerApplicationMetadata;

// Settings refreshes this page when the form is toggled; the timer is a backstop.
export const revalidate = 60;

export default async function Page() {
  const closed = !(await isFormOpen('volunteer_application'));

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
      <VolunteerApplicationPage closed={closed} />
    </>
  );
}
