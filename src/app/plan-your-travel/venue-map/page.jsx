import VenueMapPage from '@/components/travel/venue-map-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { venueMapMetadata, venueMapPath } from '@/data/venue-map';

export const metadata = venueMapMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path={venueMapPath}
        name="TASI 2026 Venue Map"
        description={venueMapMetadata.description}
        breadcrumbName="Venue Map"
        about={['TASI venue map', 'Kamaladevi Complex IIC']}
      />
      <VenueMapPage />
    </>
  );
}
