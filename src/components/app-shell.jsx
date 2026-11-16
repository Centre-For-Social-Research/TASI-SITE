'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

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
      {/* Scrolling is left to the browser: it scrolls on its own thread, so a
          busy page can't make it stutter, where a JS smooth-scroll library
          (Lenis, removed) stalled whenever the main thread did. */}
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
      <CookieConsentBanner />
      <Toaster richColors closeButton position="bottom-right" />
    </>
  );
}
