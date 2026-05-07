import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import HomeNavbar from '@/components/home/navbar';
import { partners } from '@/data/partners';

export function generateStaticParams() {
  return partners.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const partner = partners.find((p) => p.slug === slug);
  if (!partner) return {};
  return {
    title: `${partner.name} | Partners | TASI 2026`,
    description: partner.description,
  };
}

function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.857L1.715 2.25H8.12l4.257 5.649 5.867-5.649Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export default async function PartnerDetailPage({ params }) {
  const { slug } = await params;
  const partner = partners.find((p) => p.slug === slug);

  if (!partner) notFound();

  const socialLinks = [
    partner.social?.linkedin && {
      Icon: LinkedInIcon,
      href: partner.social.linkedin,
      label: 'LinkedIn',
      color:
        'border-[#0077b5]/30 bg-[#0077b5]/8 text-[#0077b5] hover:bg-[#0077b5]/15 hover:border-[#0077b5]/60',
    },
    partner.social?.instagram && {
      Icon: InstagramIcon,
      href: partner.social.instagram,
      label: 'Instagram',
      color:
        'border-[#e1306c]/30 bg-[#e1306c]/8 text-[#e1306c] hover:bg-[#e1306c]/15 hover:border-[#e1306c]/60',
    },
    partner.social?.twitter && {
      Icon: XIcon,
      href: partner.social.twitter,
      label: 'X (Twitter)',
      color:
        'border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200 hover:border-stone-500',
    },
    partner.social?.youtube && {
      Icon: YouTubeIcon,
      href: partner.social.youtube,
      label: 'YouTube',
      color:
        'border-[#ff0000]/30 bg-[#ff0000]/8 text-[#ff0000] hover:bg-[#ff0000]/15 hover:border-[#ff0000]/60',
    },
  ].filter(Boolean);

  return (
    <>
      <HomeNavbar />
      <main className="min-h-screen bg-[#f1f1f0] dark:bg-stone-950">
        {/* ── Gradient banner ──────────────────────────────────────── */}
        {/* pt-[72px] clears the fixed navbar; pb-20 leaves room for card overlap */}
        <div className="bg-[linear-gradient(135deg,#350265_0%,#6a115e_52%,#c0392b_100%)] pb-20 pt-[72px] md:pb-24 md:pt-[80px]">
          <div className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-6 md:pt-8">
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                  clipRule="evenodd"
                />
              </svg>
              All Partners
            </Link>
          </div>
        </div>

        {/* ── Cards (overlap the banner bottom) ───────────────────── */}
        <div className="mx-auto w-full max-w-5xl px-4 pb-20 md:px-6">
          <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5">
            {/* ── LEFT: Logo card ─────────────────────────────────── */}
            <div className="flex w-full flex-col rounded-[10px] border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.10)] dark:border-slate-700 dark:bg-slate-900 md:w-[280px] md:shrink-0">
              {/* Logo */}
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

              {/* Social icons */}
              {socialLinks.length > 0 && (
                <div className="flex items-center justify-center gap-2 border-t border-stone-100 py-4 dark:border-slate-800">
                  {socialLinks.map(({ Icon, href, label, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${color}`}
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              )}

              {/* Website */}
              {partner.website && partner.website !== '#' && (
                <div className="border-t border-stone-100 px-5 py-3 dark:border-slate-800">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <GlobeIcon />
                    Website
                  </a>
                </div>
              )}

              {/* See all partners */}
              <div className="border-t border-stone-100 px-5 pb-5 pt-3 dark:border-slate-800">
                <Link
                  href="/partners"
                  className="flex w-full items-center justify-center rounded-[10px] bg-[#16a34a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#15803d]"
                >
                  See all partners
                </Link>
              </div>
            </div>

            {/* ── RIGHT: Info card ─────────────────────────────────── */}
            <div className="flex flex-1 flex-col rounded-[10px] border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.10)] dark:border-slate-700 dark:bg-slate-900">
              {/* Top bar: type label + share */}
              <div className="flex items-center justify-between px-8 pt-7 pb-0 md:px-10 md:pt-8">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400 dark:text-slate-500">
                  {partner.type}
                </span>
                <button
                  type="button"
                  aria-label="Share"
                  className="flex items-center gap-1.5 rounded-[10px] border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  <ShareIcon />
                  Share
                </button>
              </div>

              {/* Name */}
              <h1 className="mt-3 px-8 text-[2.4rem] font-black leading-tight tracking-tight text-stone-900 dark:text-white md:px-10 md:text-5xl">
                {partner.name}
              </h1>

              {/* Description */}
              <p className="mt-5 grow px-8 pb-2 text-[0.975rem] leading-relaxed text-stone-600 dark:text-slate-300 md:px-10">
                {partner.description}
              </p>

              {/* Country + Category — pinned to bottom */}
              <div className="mx-8 mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-stone-100 py-5 dark:border-slate-800 md:mx-10">
                <span className="flex items-center gap-2 text-sm text-stone-500 dark:text-slate-400">
                  <FlagIcon />
                  {partner.country}
                </span>
                <span className="flex items-center gap-2 text-sm text-stone-500 dark:text-slate-400">
                  <GridIcon />
                  {partner.category}
                </span>
              </div>
            </div>
          </div>

          {/* ── Prev / Next navigation ───────────────────────────── */}
          <PartnerPagination currentSlug={slug} />
        </div>
      </main>
    </>
  );
}

function PartnerPagination({ currentSlug }) {
  const currentIndex = partners.findIndex((p) => p.slug === currentSlug);
  const prev = currentIndex > 0 ? partners[currentIndex - 1] : null;
  const next =
    currentIndex < partners.length - 1 ? partners[currentIndex + 1] : null;

  if (!prev && !next) return null;

  return (
    <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-200 pt-6 dark:border-slate-800">
      <div className="flex-1">
        {prev && (
          <Link
            href={`/partners/${prev.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-stone-900 dark:text-slate-400 dark:hover:text-white"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-stone-200 bg-white text-stone-500 transition group-hover:border-stone-400 dark:border-slate-600 dark:bg-slate-800"
              aria-hidden="true"
            >
              ←
            </span>
            <span className="hidden sm:inline">{prev.name}</span>
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
              →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
