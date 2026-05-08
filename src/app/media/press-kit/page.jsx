import MediaResourceListPage from '@/components/media/media-resource-list-page';
import { mediaPressKitMetadata, pressKitPage } from '@/data/media-page';

export const metadata = mediaPressKitMetadata;

export default function Page() {
  return <MediaResourceListPage page={pressKitPage} />;
}
