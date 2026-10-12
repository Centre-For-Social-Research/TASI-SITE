import { isFormOpen } from '@/lib/form-settings';
import RegisterPage from '@/components/register/register-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { registerPageMetadata } from '@/data/register-page';

export const metadata = registerPageMetadata;

// Settings refreshes this page when the form is toggled; the timer is a backstop.
export const revalidate = 60;

export default async function Page() {
  const closed = !(await isFormOpen('registration'));

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
      <RegisterPage closed={closed} />
    </>
  );
}
