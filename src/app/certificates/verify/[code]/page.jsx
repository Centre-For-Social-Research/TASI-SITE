import { cache } from 'react';
import Link from 'next/link';
import { BadgeCheck, CircleAlert, CircleX } from 'lucide-react';

import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import CertificatePreview from '@/components/certificates/certificate-preview';
import CertificateFileCheck from '@/components/certificates/certificate-file-check';
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
const lookup = cache(async (rawCode) => {
  const code = normalizeCertificateCode(decodeURIComponent(rawCode));
  const record = isValidCertificateCode(code)
    ? await getCertificateForVerification(code)
    : null;
  return { code, record };
});

// The title and description become the LinkedIn / X share card text, so an
// active certificate names its holder. Unknown or revoked IDs stay generic.
export async function generateMetadata({ params }) {
  const { record } = await lookup((await params).code);
  const active = record?.status === 'active';
  const title = active
    ? `${record.name} · Certificate of Participation · TASI 2026`
    : 'Certificate Verification | TASI 2026';
  const description = active
    ? `${record.name} took part in the Trust & Safety India Festival 2026, 14–15 October 2026, New Delhi. Certificate ${record.code}, issued by the Centre for Social Research.`
    : 'Check a TASI 2026 certificate of participation.';
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: 'website', siteName: 'TASI 2026' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const VIEWS = {
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
};

export default async function Page({ params }) {
  const { code, record } = await lookup((await params).code);
  const edition = record ? getCertificateEdition(record.edition) : null;
  const state = !record
    ? 'missing'
    : record.status === 'active'
      ? 'valid'
      : 'revoked';
  const view = VIEWS[state];

  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-14 md:py-20" compactParticles>
          <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
            <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-white/75">
              Trust &amp; Safety India Festival · Certificate verification
            </p>
            <div className="mt-6 overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div
                className={`flex items-center justify-center gap-3 border-b border-stone-200 px-6 py-5 dark:border-slate-800 ${state === 'valid' ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
              >
                <view.Icon className={`h-8 w-8 flex-none ${view.tone}`} />
                <h1 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-2xl">
                  {view.title}
                </h1>
              </div>

              {state === 'missing' ? (
                <div className="p-6 text-center md:p-8">
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                    We have no certificate with the ID{' '}
                    <span className="font-mono font-bold">{code || '—'}</span>.
                    Check the ID for typos. Certificate IDs look like
                    TASI26-ABCD2345.
                  </p>
                </div>
              ) : (
                <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.25fr_1fr]">
                  <div
                    className={
                      state === 'revoked' ? 'opacity-50 grayscale' : ''
                    }
                  >
                    <CertificatePreview
                      signed
                      name={record.name}
                      code={record.code}
                      issuedOn={formatIssueDate(record.issuedAt)}
                      label={state === 'valid' ? 'Verified' : 'Revoked'}
                    />
                  </div>
                  <div className="space-y-6">
                    <dl className="space-y-3 text-sm">
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
                    {state === 'valid' ? (
                      <CertificateFileCheck expectedCode={record.code} />
                    ) : null}
                  </div>
                </div>
              )}

              <div className="border-t border-stone-200 px-6 py-4 text-center dark:border-slate-800">
                <Link
                  href="/certificates/verify"
                  className="text-sm font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
                >
                  Check another certificate
                </Link>
              </div>
            </div>
          </div>
        </BrandedPageHero>
      </main>
    </>
  );
}
