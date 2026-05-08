import ExhibitionPage from '@/components/exhibition/exhibition-page';
import { exhibitionMetadata } from '@/data/exhibition-page';

export const metadata = exhibitionMetadata;

export default function Page() {
  return <ExhibitionPage />;
}
