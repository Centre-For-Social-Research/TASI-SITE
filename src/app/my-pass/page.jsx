import { notFound } from 'next/navigation';
import { Mail, QrCode, ShieldCheck, Users } from 'lucide-react';

import HomeNavbar from '@/components/home/navbar';
import PassIllustration from '@/components/my-pass/pass-illustration';
import PassLookupForm from '@/components/my-pass/pass-lookup-form';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import passLookupWindow from '@/lib/pass-lookup-window.cjs';

const { isPassLookupOpen } = passLookupWindow;

// Evaluated per request so the page appears and disappears on the festival
// dates without a deploy.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Find My Pass | TASI 2026',
  description: 'Resend your TASI 2026 QR entry pass to your registered email.',
  robots: { index: false, follow: false },
};

const CONTACT_EMAIL = 'india@trustandsafetyfestival.com';

const FACTS = [
  {
    icon: ShieldCheck,
    title: 'Only to your inbox',
    text: 'Your pass is only ever sent to the email on your registration.',
  },
  {
    icon: QrCode,
    title: 'Same QR code',
    text: 'Any earlier copy of your pass keeps working at the desk.',
  },
  {
    icon: Users,
    title: 'Guests and speakers',
    text: 'Guests, speakers and on-site registrations: please visit the registration desk.',
  },
];

export default function Page() {
  if (!isPassLookupOpen()) {
    notFound();
  }

  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-16 md:py-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 md:px-8 lg:grid-cols-[1fr_0.95fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
                TASI 2026 · Festival week
              </p>
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
                Lost your pass?
                <span className="mt-2 block text-[#ffd919]">
                  We&apos;ll send it again.
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/85 md:text-lg lg:mx-0">
                Enter the email you registered with and your QR entry pass lands
                back in your inbox in a couple of minutes.
              </p>
              <div className="mt-10 hidden lg:block">
                <PassIllustration />
              </div>
            </div>

            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <PassLookupForm />
            </div>
          </div>
        </BrandedPageHero>

        <section className="border-b border-stone-200 dark:border-slate-800">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
            {FACTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#ffd919] text-[#350265]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">
                    {title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 pb-10 text-sm text-stone-600 dark:text-slate-400 md:px-8">
            <Mail className="h-4 w-4" />
            Still stuck?{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-bold text-rc-primary underline-offset-4 hover:underline dark:text-amber-300"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </main>
    </>
  );
}
