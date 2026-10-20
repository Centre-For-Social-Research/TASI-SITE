'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import LenisProvider from '@/components/lenis-provider';

// Public-site-only pieces load as their own chunks, so /admin and /studio
// (which return early below) don't download them.
const CookieConsentBanner = dynamic(
  () => import('@/components/ui/cookie-consent-banner')
);
const Footer = dynamic(() =>
  import('@/components/ui/demo').then((mod) => mod.Footer)
);

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isStudioRoute = pathname?.startsWith('/studio');
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isStudioRoute || isAdminRoute) {
    return children;
  }

  return (
    <>
      <LenisProvider>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </LenisProvider>
      <CookieConsentBanner />
      <Toaster richColors closeButton position="bottom-right" />
    </>
  );
}
