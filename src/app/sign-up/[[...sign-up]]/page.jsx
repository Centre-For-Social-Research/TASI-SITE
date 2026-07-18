import { redirect } from 'next/navigation';
import operatorAuthUi from '@/lib/operator-auth-ui.cjs';

const { getOperatorRedirectTarget } = operatorAuthUi;

export const metadata = {
  title: 'Sign Up | TASI 2026',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const redirectTarget = getOperatorRedirectTarget(
    resolvedSearchParams?.redirect_url
  );

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams || {})) {
    if (key === 'redirect_url') continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (typeof item === 'string') params.append(key, item);
    }
  }
  params.set('redirect_url', redirectTarget);

  redirect(`/sign-in?${params.toString()}`);
}
