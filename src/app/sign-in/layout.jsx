import TasiClerkProvider from '@/components/auth/clerk-provider';

export const metadata = {
  title: 'Sign In | TASI 2026',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInLayout({ children }) {
  return <TasiClerkProvider>{children}</TasiClerkProvider>;
}
