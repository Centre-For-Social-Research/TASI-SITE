import Link from 'next/link';
import HomeNavbar from '@/components/home/navbar';
import PartnersEditionView from '@/components/partners/partners-edition-view';
import {
  DEFAULT_PARTNER_EDITION,
  PARTNER_EDITIONS,
  getPartnersForEdition,
  getSessionPartnersForEdition,
  partnersPageCta,
  partnersPageHero,
  partnersPageSessionSection,
} from '@/data/partners-page';

// Only what a partner card shows travels to the browser. Cards use the
// short name where a partner has one; the partner page keeps the full name.
const toCard = ({ name, shortName, slug, logo, category }) => ({
  name: shortName || name,
  slug,
  logo,
  category,
});

const partnersByYear = Object.fromEntries(
  PARTNER_EDITIONS.map((edition) => [
    edition,
    getPartnersForEdition(edition).map(toCard),
  ])
);

const sessionPartnersByYear = Object.fromEntries(
  PARTNER_EDITIONS.map((edition) => [
    edition,
    getSessionPartnersForEdition(edition).map(toCard),
  ])
);

export default function PartnersPage({
  initialYear = DEFAULT_PARTNER_EDITION,
}) {
  return (
    <>
      <HomeNavbar />
      <main className="bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <PartnersEditionView
          key={initialYear}
          initialYear={initialYear}
          eyebrow={partnersPageHero.eyebrow}
          heroByYear={partnersPageHero.editions}
          partnersByYear={partnersByYear}
          sessionPartnersByYear={sessionPartnersByYear}
          sessionSection={partnersPageSessionSection}
        />

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
