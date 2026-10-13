import { Download, ImageIcon, ShieldCheck } from 'lucide-react';

import HomeNavbar from '@/components/home/navbar';
import ShareCardBuilder from '@/components/share-card/share-card-builder';
import BrandedPageHero from '@/components/ui/branded-page-hero';

export const metadata = {
  title: "I'm Attending TASI 2026 | Make Your Card",
  description:
    'Make your own "I\'m attending #TASI2026" card to share on LinkedIn, Instagram or WhatsApp.',
  alternates: { canonical: '/my-card' },
};

const STEPS = [
  {
    icon: ImageIcon,
    title: 'Make it',
    text: 'Add your name and organisation, and a photo if you like.',
  },
  {
    icon: Download,
    title: 'Share it',
    text: 'Download the card or share it straight from your phone, with a caption ready to paste.',
  },
  {
    icon: ShieldCheck,
    title: 'Stays with you',
    text: 'The card is made on your device. Your photo is never uploaded or saved.',
  },
];

export default function Page() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
                TASI 2026 · 14-15 October
              </p>
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
                Going to TASI 2026?
                <span className="mt-2 block text-[#ffd919]">
                  Make your card.
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
                Get your own &ldquo;I&apos;m attending #TASI2026&rdquo; card and
                let your network know you&apos;ll be there.
              </p>
            </div>
            <div className="mt-10">
              <ShareCardBuilder />
            </div>
          </div>
        </BrandedPageHero>

        <section className="border-b border-stone-200 dark:border-slate-800">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[#ffd919] text-[#350265]">
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
        </section>
      </main>
    </>
  );
}
