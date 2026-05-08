import RegisterPage from '@/components/register/register-page';
import { registerPageMetadata } from '@/data/register-page';

export const metadata = registerPageMetadata;

export default function Page() {
  return <RegisterPage />;
}
