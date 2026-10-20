import Link from 'next/link';
import { BadgeCheck, CircleAlert, CircleX } from 'lucide-react';

import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { getCertificateForVerification } from '@/lib/certificates-db';
import certificateUtils from '@/lib/certificate-utils.cjs';

const {
  formatIssueDate,
  getCertificateEdition,
  isValidCertificateCode,
  normalizeCertificateCode,
} = certificateUtils;

export const dynamic = 'force-dynamic';

// Shows only what is printed on the certificate: no email, organisation or
// attendance detail.
export const metadata = {
  title: 'Certificate Verification | TASI 2026',
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const code = normalizeCertificateCode(
    decodeURIComponent((await params).code)
  );
  const record = isValidCertificateCode(code)
    ? await getCertificateForVerification(code)
    : null;
  const edition = record ? getCertificateEdition(record.edition) : null;
  const state = !record
    ? 'missing'
    : record.status === 'active'
      ? 'valid'
      : 'revoked';

  const view = {
    valid: {
      Icon: BadgeCheck,
      tone: 'text-emerald-600',
      title: 'Genuine certificate',
    },
    revoked: {
      Icon: CircleX,
      tone: 'text-red-600',
      title: 'This certificate has been revoked',
    },
    missing: {
      Icon: CircleAlert,
      tone: 'text-amber-600',
      title: 'No certificate found',
    },
  }[state];

  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-16 md:py-24">
          <div className="mx-auto w-full max-w-xl px-4 md:px-8">
            <div className="rounded-[10px] border border-stone-200 bg-white p-6 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900 md:p-8">
              <view.Icon className={`mx-auto h-12 w-12 ${view.tone}`} />
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                {view.title}
              </h1>
              {state === 'missing' ? (
                <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                  We have no certificate with the ID{' '}
                  <span className="font-mono font-bold">{code || '—'}</span>.
                  Check the ID for typos. Certificate IDs look like
                  TASI26-ABCD2345.
                </p>
              ) : (
                <dl className="mt-6 space-y-3 text-left text-sm">
                  {[
                    ['Name', record.name],
                    [
                      'Certificate',
                      state === 'valid'
                        ? 'Certificate of Participation'
                        : 'Revoked by the organiser',
                    ],
                    ['Event', edition.eventName],
                    ['Dates', edition.dates],
                    ['Issued by', 'Centre for Social Research'],
                    ['Issued on', formatIssueDate(record.issuedAt)],
                    ['Certificate ID', record.code],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-6 border-b border-stone-100 pb-3 dark:border-slate-800"
                    >
                      <dt className="text-stone-500 dark:text-slate-400">
                        {label}
                      </dt>
                      <dd
                        className={`text-right font-semibold text-stone-900 dark:text-white ${label === 'Certificate ID' ? 'font-mono' : ''}`}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              <Link
                href="/certificates/verify"
                className="mt-6 inline-block text-sm font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
              >
                Check another certificate
              </Link>
            </div>
          </div>
        </BrandedPageHero>
      </main>
    </>
  );
}
