import MediaAccreditationPage from '@/components/media/media-accreditation-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { mediaAccreditationMetadata } from '@/data/media-accreditation';

export const metadata = mediaAccreditationMetadata;

export default function Page() {
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
      <MediaAccreditationPage />
    </>
  );
}
