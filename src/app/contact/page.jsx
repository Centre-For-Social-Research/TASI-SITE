import ContactPage from '@/components/contact/contact-page';
import { contactMetadata } from '@/data/contact-page';

export const metadata = contactMetadata;

export default function Page() {
  return <ContactPage />;
}
