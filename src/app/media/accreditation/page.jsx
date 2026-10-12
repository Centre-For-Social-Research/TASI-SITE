import { isFormOpen } from '@/lib/form-settings';
import MediaAccreditationPage from '@/components/media/media-accreditation-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { mediaAccreditationMetadata } from '@/data/media-accreditation';

export const metadata = mediaAccreditationMetadata;

// Settings refreshes this page when the form is toggled; the timer is a backstop.
export const revalidate = 60;

export default async function Page() {
  const closed = !(await isFormOpen('media_accreditation'));

  return (
    <>
      <PageSeoJsonLd
        path="/media/accreditation"
        name="Trust and Safety India Festival Media Accreditation"
        description={mediaAccreditationMetadata.description}
        breadcrumbName="Media Accreditation"
        about={[
          'TASI 2026 media accreditation',
          'Trust and Safety India Festival press access',
          'TASI journalist registration',
          'New Delhi trust and safety conference media',
        ]}
      />
      <MediaAccreditationPage closed={closed} />
    </>
  );
}
