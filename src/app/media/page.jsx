import MediaPage from '@/components/media/media-page';
import { mediaMetadata } from '@/data/media-page';

export const metadata = mediaMetadata;

export default function Page() {
  return <MediaPage />;
}
