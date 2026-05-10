import ContactPage from '@/components/contact/contact-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { contactMetadata } from '@/data/contact-page';

export const metadata = contactMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/contact"
        name="Contact Trust and Safety India Festival"
        description={contactMetadata.description}
        breadcrumbName="Contact"
        about={[
          'TASI contact',
          'Trust and Safety India Festival organizers',
          'TASI sponsorship contact',
          'TASI media contact',
        ]}
      />
      <ContactPage />
    </>
  );
}
