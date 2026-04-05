'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import CookieConsentBanner from '@/components/ui/cookie-consent-banner';
import { Footer } from '@/components/ui/demo';
import LenisProvider from '@/components/lenis-provider';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isStudioRoute = pathname?.startsWith('/studio');

  if (isStudioRoute) {
    return children;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LenisProvider>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </LenisProvider>
      <CookieConsentBanner />
      <Toaster richColors closeButton position="bottom-right" />
    </ThemeProvider>
  );
}
