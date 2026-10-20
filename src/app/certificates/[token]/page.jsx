import Link from 'next/link';

import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import CertificateClaim from '@/components/certificates/certificate-claim';
import { getCertificateByToken } from '@/lib/certificates-db';
import certificateUtils from '@/lib/certificate-utils.cjs';

const {
  MAX_NAME_CHANGES,
  buildLinkedInAddUrl,
  buildVerifyUrl,
  isValidClaimToken,
} = certificateUtils;

export const dynamic = 'force-dynamic';

// The link is a personal credential: keep it out of search engines and
// out of the Referer header sent to LinkedIn and other sites.
export const metadata = {
  title: 'Your Certificate | TASI 2026',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

function siteUrl() {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://trustandsafetyindia.org'
  );
}

export default async function Page({ params }) {
  const { token } = await params;
  const certificate = isValidClaimToken(token)
    ? await getCertificateByToken(token)
    : null;
  const active = certificate?.status === 'active';

  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-16 md:py-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="text-center lg:text-left">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
                TASI 2026 · 14–15 October
              </p>
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
                {active ? 'Your certificate' : 'This link is no longer valid'}
                {active ? (
                  <span className="mt-2 block text-[#ffd919]">is ready.</span>
                ) : null}
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/85 md:text-lg lg:mx-0">
                {active
                  ? 'Check the spelling of your name, then download your certificate of participation.'
                  : 'Each new email gets a fresh link, and older links stop working. You can ask for a new one below.'}
              </p>
            </div>
            <div className="mx-auto w-full max-w-xl lg:max-w-none">
              {active ? (
                <CertificateClaim
                  token={token}
                  code={certificate.code}
                  initialName={certificate.name}
                  initialChangesLeft={Math.max(
                    0,
                    MAX_NAME_CHANGES - certificate.nameChangeCount
                  )}
                  linkedInUrl={buildLinkedInAddUrl({
                    edition: certificate.edition,
                    code: certificate.code,
                    siteUrl: siteUrl(),
                  })}
                  verifyUrl={buildVerifyUrl({
                    siteUrl: siteUrl(),
                    code: certificate.code,
                  })}
                />
              ) : (
                <div className="rounded-[10px] border border-stone-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 md:p-8">
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                    Enter the email you registered with and we&apos;ll send a
                    new link to your certificate.
                  </p>
                  <Link
                    href="/certificates"
                    className="mt-5 inline-flex h-12 items-center rounded-[10px] bg-[#350265] px-6 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-[#2a0150]"
                  >
                    Get a new link
                  </Link>
                </div>
              )}
            </div>
          </div>
        </BrandedPageHero>
      </main>
    </>
  );
}
