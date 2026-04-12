import Link from 'next/link';
import Image from 'next/image';
import HomeNavbar from '@/components/home/navbar';
import HomeFooter from '@/components/home/footer';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { partners } from '@/data/partners';

export const metadata = {
  title: 'Partners | TASI 2026',
  description:
    'Meet the organisations that partnered with TASI 2025 to advance trust and safety conversations in India and globally.',
};

export default function PartnersPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="min-h-[300px] py-14 md:min-h-[360px] md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              TASI 2025
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Our Partners
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              A diverse network of technology companies, civil society
              organisations, diplomatic missions, and research institutions that
              shaped the trust and safety conversation at TASI 2025.
            </p>
          </div>
        </BrandedPageHero>

        <section className="py-14 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {partners.map((partner) => (
                <Link
                  key={partner.slug}
                  href={`/partners/${partner.slug}`}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg forced-color-adjust-none [color-scheme:light]"
                >
                  {/* Logo area */}
                  <div className="flex items-center justify-center bg-white px-6 py-8 h-44">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      loading="lazy"
                      width={160}
                      height={80}
                      className="h-16 w-full object-contain transition-transform duration-200 group-hover:scale-105"
                      quality={85}
                    />
                  </div>

                  {/* Info footer */}
                  <div className="bg-[#C8177A] px-4 py-3">
                    <p className="text-[13px] font-bold leading-tight text-white">
                      {partner.name}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/80">
                      {partner.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-white py-14 dark:border-slate-800 dark:bg-stone-950 md:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-400">
              Partner With TASI 2026
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Join the network
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-slate-300">
              Interested in partnering with TASI 2026? Explore sponsorship
              opportunities and partnership formats aligned to your
              organisation&apos;s goals.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/sponsor"
                className="inline-flex items-center justify-center rounded-[10px] bg-[#350265] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4a0390]"
              >
                View Partnership Opportunities
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-[10px] border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:border-stone-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}

