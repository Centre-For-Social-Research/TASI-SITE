import GetInvolvedPage from '@/components/get-involved/get-involved-page';
import { getInvolvedMetadata } from '@/data/get-involved-page';

export const metadata = getInvolvedMetadata;

export default function Page() {
  return <GetInvolvedPage />;
}
