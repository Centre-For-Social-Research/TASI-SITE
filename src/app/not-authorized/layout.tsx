import TasiClerkProvider from '@/components/auth/clerk-provider';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Not Authorized | TASI 2026',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotAuthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TasiClerkProvider>{children}</TasiClerkProvider>;
}
