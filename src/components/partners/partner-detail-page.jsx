import Image from 'next/image';
import Link from 'next/link';
import HomeNavbar from '@/components/home/navbar';
import {
  buildPartnerSocialLinks,
  getPartnerNavigation,
} from '@/data/partners-page';
import { partnerIcons, partnerSocialIcons } from './partner-icons';

const ArrowLeft = partnerIcons.arrowLeft;
const ArrowRight = partnerIcons.arrowRight;
const Flag = partnerIcons.flag;
const Globe = partnerIcons.globe;
const Grid = partnerIcons.grid;
const Share = partnerIcons.share;

export default function PartnerDetailPage({ partner }) {
  const socialLinks = buildPartnerSocialLinks(partner);

  return (
    <>
      <HomeNavbar />
      <main className="min-h-screen bg-[#f1f1f0] dark:bg-stone-950">
        <div className="bg-[linear-gradient(135deg,#350265_0%,#6a115e_52%,#c0392b_100%)] pb-20 pt-[72px] md:pb-24 md:pt-[80px]">
          <div className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-6 md:pt-8">
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              All Partners
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-4 pb-20 md:px-6">
          <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5">
            <div className="flex w-full flex-col rounded-[10px] border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.10)] dark:border-slate-700 dark:bg-slate-900 md:w-[280px] md:shrink-0">
              <div className="flex flex-1 items-center justify-center p-10">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={180}
                  height={90}
                  className="max-h-[100px] w-full object-contain"
                  priority
                />
              </div>

              {socialLinks.length > 0 && (
                <div className="flex items-center justify-center gap-2 border-t border-stone-100 py-4 dark:border-slate-800">
                  {socialLinks.map(({ href, label, network, color }) => {
                    const Icon = partnerSocialIcons[network];

                    return (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              )}

              {partner.website && partner.website !== '#' && (
                <div className="border-t border-stone-100 px-5 py-3 dark:border-slate-800">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                </div>
              )}

              <div className="border-t border-stone-100 px-5 pb-5 pt-3 dark:border-slate-800">
                <Link
                  href="/partners"
                  className="flex w-full items-center justify-center rounded-[10px] bg-[#16a34a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#15803d]"
                >
                  See all partners
                </Link>
              </div>
            </div>

            <div className="flex flex-1 flex-col rounded-[10px] border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.10)] dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between px-8 pb-0 pt-7 md:px-10 md:pt-8">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400 dark:text-slate-500">
                  {partner.type}
                </span>
                <button
                  type="button"
                  aria-label="Share"
                  className="flex items-center gap-1.5 rounded-[10px] border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  <Share className="h-4 w-4" />
                  Share
                </button>
              </div>

              <h1 className="mt-3 px-8 text-[2.4rem] font-black leading-tight tracking-tight text-stone-900 dark:text-white md:px-10 md:text-5xl">
                {partner.name}
              </h1>

              <p className="mt-5 grow px-8 pb-2 text-[0.975rem] leading-relaxed text-stone-600 dark:text-slate-300 md:px-10">
                {partner.description}
              </p>

              <div className="mx-8 mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-stone-100 py-5 dark:border-slate-800 md:mx-10">
                <span className="flex items-center gap-2 text-sm text-stone-500 dark:text-slate-400">
                  <Flag className="h-4 w-4 shrink-0" />
                  {partner.country}
                </span>
                <span className="flex items-center gap-2 text-sm text-stone-500 dark:text-slate-400">
                  <Grid className="h-4 w-4 shrink-0" />
                  {partner.category}
                </span>
              </div>
            </div>
          </div>

          <PartnerPagination currentSlug={partner.slug} />
        </div>
      </main>
    </>
  );
}

function PartnerPagination({ currentSlug }) {
  const { previous, next } = getPartnerNavigation(currentSlug);

  if (!previous && !next) return null;

  return (
    <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-200 pt-6 dark:border-slate-800">
      <div className="flex-1">
        {previous && (
          <Link
            href={`/partners/${previous.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-stone-900 dark:text-slate-400 dark:hover:text-white"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-stone-200 bg-white text-stone-500 transition group-hover:border-stone-400 dark:border-slate-600 dark:bg-slate-800"
              aria-hidden="true"
            >
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">{previous.name}</span>
          </Link>
        )}
      </div>
      <Link
        href="/partners"
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 transition hover:text-stone-700 dark:text-slate-500 dark:hover:text-slate-300"
      >
        All Partners
      </Link>
      <div className="flex flex-1 justify-end">
        {next && (
          <Link
            href={`/partners/${next.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-stone-900 dark:text-slate-400 dark:hover:text-white"
          >
            <span className="hidden sm:inline">{next.name}</span>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-stone-200 bg-white text-stone-500 transition group-hover:border-stone-400 dark:border-slate-600 dark:bg-slate-800"
              aria-hidden="true"
            >
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
