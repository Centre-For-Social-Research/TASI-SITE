import MediaResourceListPage from '@/components/media/media-resource-list-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import {
  mediaPressReleasesMetadata,
  pressReleasesPage,
} from '@/data/media-page';

export const metadata = mediaPressReleasesMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/media/press-releases"
        name="Trust and Safety India Festival Press Releases"
        description={mediaPressReleasesMetadata.description}
        breadcrumbName="Press Releases"
        about={[
          'TASI press releases',
          'Trust and Safety India Festival news',
          'TASI media invite',
          'TASI launch announcement',
        ]}
      />
      <MediaResourceListPage page={pressReleasesPage} />
    </>
  );
}
