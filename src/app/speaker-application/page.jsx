import { isFormOpen } from '@/lib/form-settings';
import SpeakerApplicationPage from '@/components/speakers/speaker-application-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { speakerApplicationMetadata } from '@/data/speaker-application-page';

export const metadata = speakerApplicationMetadata;

// Settings refreshes this page when the form is toggled; the timer is a backstop.
export const revalidate = 60;

export default async function Page() {
  const closed = !(await isFormOpen('speaker_application'));

  return (
    <>
      <PageSeoJsonLd
        path="/speaker-application"
        name="Apply to Speak at Trust and Safety India Festival"
        description={speakerApplicationMetadata.description}
        breadcrumbName="Speaker Application"
        about={[
          'TASI speaker application',
          'Trust and Safety India Festival speakers',
          'online safety speakers',
          'AI governance speakers',
        ]}
      />
      <SpeakerApplicationPage closed={closed} />
    </>
  );
}
