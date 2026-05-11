import ExhibitionPage from '@/components/exhibition/exhibition-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { exhibitionMetadata } from '@/data/exhibition-page';

export const metadata = exhibitionMetadata;

export default function Page() {
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
      <ExhibitionPage />
    </>
  );
}
