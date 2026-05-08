import Image from 'next/image';
import Link from 'next/link';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { partners } from '@/data/partners';
import { partnersPageCta, partnersPageHero } from '@/data/partners-page';

export default function PartnersPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="min-h-[300px] py-14 md:min-h-[360px] md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {partnersPageHero.eyebrow}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {partnersPageHero.title}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              {partnersPageHero.description}
            </p>
          </div>
        </BrandedPageHero>

        <section className="py-14 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-6 md:px-12">
            <div className="flex flex-wrap justify-center gap-8">
              {partners.map((partner) => (
                <PartnerCard key={partner.slug} partner={partner} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-white py-14 dark:border-slate-800 dark:bg-stone-950 md:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-400">
              {partnersPageCta.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              {partnersPageCta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-slate-300">
              {partnersPageCta.description}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={partnersPageCta.primary.href}
                className="inline-flex items-center justify-center rounded-[10px] bg-[#350265] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4a0390]"
              >
                {partnersPageCta.primary.label}
              </Link>
              <Link
                href={partnersPageCta.secondary.href}
                className="inline-flex items-center justify-center rounded-[10px] border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:border-stone-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {partnersPageCta.secondary.label}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function PartnerCard({ partner }) {
  return (
    <Link
      href={`/partners/${partner.slug}`}
      className="group flex w-[210px] shrink-0 flex-col overflow-hidden rounded-[10px] border border-stone-200 bg-stone-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg forced-color-adjust-none [color-scheme:light]"
    >
      <div className="flex min-h-[14rem] flex-1 items-center justify-center bg-white px-6 py-8">
        <Image
          src={partner.logo}
          alt={partner.name}
          loading="lazy"
          width={160}
          height={80}
          className="h-16 w-auto max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      <div className="mt-auto flex h-[72px] flex-col justify-center bg-[#C8177A] px-4 py-3">
        <p className="line-clamp-1 text-[13px] font-bold leading-tight text-white">
          {partner.name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/80">
          {partner.category}
        </p>
      </div>
    </Link>
  );
}
