'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import CookieConsentBanner from '@/components/ui/cookie-consent-banner';
import { Footer } from '@/components/ui/demo';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isStudioRoute = pathname?.startsWith('/studio');

  if (isStudioRoute) {
    return children;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
      <CookieConsentBanner />
    </ThemeProvider>
  );
}
