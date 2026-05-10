import MediaPage from '@/components/media/media-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { mediaMetadata } from '@/data/media-page';

export const metadata = mediaMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/media"
        name="Trust and Safety India Festival Media"
        description={mediaMetadata.description}
        breadcrumbName="Media"
        about={[
          'TASI media coverage',
          'Trust and Safety India Festival press',
          'TASI press kit',
          'media accreditation',
        ]}
      />
      <MediaPage />
    </>
  );
}
