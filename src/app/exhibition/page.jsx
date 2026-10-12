import { isFormOpen } from '@/lib/form-settings';
import ExhibitionPage from '@/components/exhibition/exhibition-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { exhibitionMetadata } from '@/data/exhibition-page';

export const metadata = exhibitionMetadata;

// Settings refreshes this page when the form is toggled; the timer is a backstop.
export const revalidate = 60;

export default async function Page() {
  const closed = !(await isFormOpen('exhibition_enquiry'));

  return (
    <>
      <PageSeoJsonLd
        path="/exhibition"
        name={exhibitionMetadata.title}
        description={exhibitionMetadata.description}
        breadcrumbName="Participation & Exhibition"
        about={[
          'Trust and Safety India Festival',
          'TASI 2026 exhibition',
          'trust and safety partnerships',
        ]}
      />
      <ExhibitionPage closed={closed} />
    </>
  );
}
