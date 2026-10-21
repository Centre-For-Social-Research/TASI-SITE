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
        <BrandedPageHero className="py-16 md:py-24" compactParticles>
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
              className="mx-auto mt-8 max-w-md rounded-[10px] border border-stone-200 bg-white p-6 text-left shadow-xl shadow-stone-900/10 dark:border-slate-800 dark:bg-slate-900 md:p-8"
            >
              <label
                htmlFor="certificate-code"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-stone-800 dark:text-slate-200"
              >
                Certificate ID
              </label>
              <div className="flex flex-col gap-3">
                <input
                  id="certificate-code"
                  name="code"
                  required
                  maxLength={20}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="TASI26-XXXXXXXX"
                  className="h-12 w-full rounded-[10px] border border-stone-200 bg-white px-4 font-mono text-base uppercase tracking-[0.08em] text-stone-900 placeholder:text-stone-400 focus:border-[#350265] focus:outline-none focus:ring-2 focus:ring-[#350265]/20"
                />
                <button
                  type="submit"
                  className="h-12 w-full rounded-[10px] bg-[#350265] px-6 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-[#2a0150]"
                >
                  Verify certificate
                </button>
              </div>
            </form>
          </div>
        </BrandedPageHero>
      </main>
    </>
  );
}
