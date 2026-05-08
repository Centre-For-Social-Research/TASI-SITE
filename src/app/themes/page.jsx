import ThemesPage from '@/components/themes/themes-page';
import { themesPageMetadata } from '@/data/themes-2026';

export const metadata = themesPageMetadata;
export const revalidate = 86400;

export default function Page() {
  return <ThemesPage />;
}
