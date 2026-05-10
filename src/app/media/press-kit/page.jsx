import MediaResourceListPage from '@/components/media/media-resource-list-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { mediaPressKitMetadata, pressKitPage } from '@/data/media-page';

export const metadata = mediaPressKitMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/media/press-kit"
        name="Trust and Safety India Festival Press Kit"
        description={mediaPressKitMetadata.description}
        breadcrumbName="Press Kit"
        about={[
          'TASI press kit',
          'Trust and Safety India Festival media resources',
          'TASI organization profile',
          'TASI speaker profiles',
        ]}
      />
      <MediaResourceListPage page={pressKitPage} />
    </>
  );
}
