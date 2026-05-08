import MediaResourceListPage from '@/components/media/media-resource-list-page';
import {
  mediaPressReleasesMetadata,
  pressReleasesPage,
} from '@/data/media-page';

export const metadata = mediaPressReleasesMetadata;

export default function Page() {
  return <MediaResourceListPage page={pressReleasesPage} />;
}
