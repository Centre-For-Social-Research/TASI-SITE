import { redirect } from 'next/navigation';

import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import certificateUtils from '@/lib/certificate-utils.cjs';

const { normalizeCertificateCode } = certificateUtils;

export const metadata = {
  title: 'Verify a Certificate | TASI 2026',
  description:
    'Check that a TASI 2026 certificate of participation is genuine.',
};

async function lookUp(formData) {
  'use server';
  const code = normalizeCertificateCode(formData.get('code')).replace(
    /\s+/g,
    ''
  );
  redirect(`/certificates/verify/${encodeURIComponent(code || 'unknown')}`);
}

export default function Page() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-16 md:py-24">
          <div className="mx-auto w-full max-w-xl px-4 text-center md:px-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
              TASI 2026 · Certificates
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Verify a certificate
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/85">
              Enter the certificate ID printed at the bottom of the certificate,
              for example TASI26-ABCD2345.
            </p>
            <form
              action={lookUp}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                name="code"
                required
                maxLength={20}
                autoComplete="off"
                spellCheck={false}
                placeholder="TASI26-XXXXXXXX"
                aria-label="Certificate ID"
                className="h-12 flex-1 rounded-[10px] border border-white/30 bg-white px-4 font-mono text-base uppercase text-stone-900 placeholder:text-stone-400"
              />
              <button
                type="submit"
                className="h-12 rounded-[10px] bg-[#ffd919] px-6 text-xs font-black uppercase tracking-[0.14em] text-[#350265] hover:bg-[#ffe34d]"
              >
                Verify
              </button>
            </form>
          </div>
        </BrandedPageHero>
      </main>
    </>
  );
}
