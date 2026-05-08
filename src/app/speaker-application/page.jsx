import SpeakerApplicationPage from '@/components/speakers/speaker-application-page';
import { speakerApplicationMetadata } from '@/data/speaker-application-page';

export const metadata = speakerApplicationMetadata;

export default function Page() {
  return <SpeakerApplicationPage />;
}
