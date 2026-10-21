import Link from 'next/link';

import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import CertificateClaim from '@/components/certificates/certificate-claim';
import {
  hasCertificateSession,
  resolveCertificateLink,
} from '@/lib/certificate-access';
import certificateUtils from '@/lib/certificate-utils.cjs';
import certificateSession from '@/lib/certificate-session.cjs';

const {
  MAX_NAME_CHANGES,
  buildLinkedInAddUrl,
  buildVerifyUrl,
  formatIssueDate,
} = certificateUtils;
const { maskEmail } = certificateSession;

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

const PROBLEMS = {
  not_found: [
    'This link is not valid',
    'Check you used the full link from your email, or ask for a new one.',
  ],
  expired: [
    'This link has expired',
    'Links work for 30 days, and each new email replaces the last one. Ask for a fresh link below.',
  ],
  revoked: [
    'This certificate is no longer active',
    'If you think this is a mistake, write to tasi.comms@csrindia.org.',
  ],
};

export default async function Page({ params, searchParams }) {
  const { token } = await params;
  // The code email links here with ?code=123456 so the attendee does not
  // have to copy it. Only a well-formed code is passed on; nothing is used
  // until they tap Verify.
  const codeParam = String((await searchParams)?.code || '');
  const initialCode = /^\d{6}$/.test(codeParam) ? codeParam : '';
  const link = await resolveCertificateLink(token);
  const certificate = link.certificate;
  let initialStep = 'verify';
  if (link.state === 'ok' && (await hasCertificateSession(link))) {
    initialStep = certificate.nameConfirmedAt ? 'ready' : 'confirm';
  }
  const [title, note] = PROBLEMS[link.state] || [];

  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-4 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="text-center lg:pt-6 lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                TASI 2026 · Certificate of Participation
              </p>
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-5xl">
                {link.state === 'ok' ? (
                  <>
                    Your certificate,
                    <span className="mt-2 block text-[#ffd919]">
                      {certificate.name.split(' ')[0]}.
                    </span>
                  </>
                ) : (
                  title
                )}
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/85 lg:mx-0">
                {link.state === 'ok'
                  ? 'Three quick steps: confirm it is you, check your name, then download and share. Your certificate carries a unique ID anyone can verify.'
                  : note}
              </p>
            </div>
            <div className="mx-auto w-full max-w-xl lg:max-w-none">
              {link.state === 'ok' ? (
                <CertificateClaim
                  token={token}
                  code={certificate.code}
                  maskedEmail={maskEmail(certificate.email)}
                  initialStep={initialStep}
                  initialCode={initialStep === 'verify' ? initialCode : ''}
                  initialName={certificate.name}
                  initialChangesLeft={Math.max(
                    0,
                    MAX_NAME_CHANGES - certificate.nameChangeCount
                  )}
                  issuedOn={formatIssueDate(certificate.issuedAt)}
                  linkedInAddUrl={buildLinkedInAddUrl({
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
