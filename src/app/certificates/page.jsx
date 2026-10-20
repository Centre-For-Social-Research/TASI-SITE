import Link from 'next/link';

import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import CertificateRequestForm from '@/components/certificates/certificate-request-form';

export const metadata = {
  title: 'Certificates | TASI 2026',
  description:
    'Get your TASI 2026 certificate of participation, or check that a certificate is genuine.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-16 md:py-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 md:px-8 lg:grid-cols-[1fr_0.95fr]">
            <div className="text-center lg:text-left">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
                TASI 2026 · Certificates
              </p>
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
                Lost your link?
                <span className="mt-2 block text-[#ffd919]">
                  We&apos;ll send a new one.
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/85 md:text-lg lg:mx-0">
                Certificates of participation went to everyone who checked in at
                TASI 2026. Enter your registered email and we&apos;ll send you a
                fresh download link.
              </p>
              <p className="mt-6 text-sm text-white/80">
                Checking a certificate?{' '}
                <Link
                  href="/certificates/verify"
                  className="font-bold text-[#ffd919] underline-offset-4 hover:underline"
                >
                  Verify it here
                </Link>
              </p>
            </div>
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <CertificateRequestForm />
            </div>
          </div>
        </BrandedPageHero>
      </main>
    </>
  );
}
