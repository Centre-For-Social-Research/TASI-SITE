import RegisterPage from '@/components/register/register-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { registerPageMetadata } from '@/data/register-page';

export const metadata = registerPageMetadata;

export default function Page() {
  return (
    <>
      <PageSeoJsonLd
        path="/register"
        name="Trust and Safety India Festival Registration"
        description={registerPageMetadata.description}
        breadcrumbName="Register"
        about={[
          'TASI 2026 registration',
          'Trust and Safety India Festival registration',
          'online safety conference India',
          'platform accountability event',
        ]}
      />
      <RegisterPage />
    </>
  );
}
