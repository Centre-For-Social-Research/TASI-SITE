import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Info, Mic, Ticket } from 'lucide-react';
import BreadcrumbJsonLd from '@/components/seo/breadcrumb-json-ld';
import JsonLdScript from '@/components/seo/json-ld-script';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';

const siteUrl = 'https://trustandsafetyindia.org';
const pagePath = '/trust-and-safety-india-festival';
const pageUrl = `${siteUrl}${pagePath}`;
const pageTitle =
  'Trust and Safety India Festival | India Trust and Safety Convening';
const pageDescription =
  "Trust and Safety India Festival is India's national convening for trust and safety, online safety, platform accountability, responsible AI, child safety, digital rights, and safer technology ecosystems.";

export const revalidate = 86400;

export const metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'Trust and Safety India Festival',
    'Trust and Safety India Festival 2026',
    'TASI 2026',
    'TASI India',
    'India trust and safety convening',
    'trust and safety conference India',
    'online safety India',
    'platform accountability India',
    'responsible AI India',
  ],
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pagePath,
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: ['/twitter-image'],
  },
};

const focusAreas = [
  'Trust and safety operations',
  'Online safety and digital wellbeing',
  'Responsible AI and AI governance',
  'Child safety and youth protection',
  'Platform accountability and regulation',
  'Technology-facilitated gender-based violence',
];

const themeCardStyles = [
  {
    card: 'border-pink-200 bg-pink-50 shadow-pink-200/60 dark:border-pink-400/30 dark:bg-pink-950/30 dark:shadow-pink-950/20',
    accent: 'bg-pink-500',
  },
  {
    card: 'border-sky-200 bg-sky-50 shadow-sky-200/60 dark:border-sky-400/30 dark:bg-sky-950/30 dark:shadow-sky-950/20',
    accent: 'bg-sky-500',
  },
  {
    card: 'border-violet-200 bg-violet-50 shadow-violet-200/60 dark:border-violet-400/30 dark:bg-violet-950/30 dark:shadow-violet-950/20',
    accent: 'bg-violet-500',
  },
  {
    card: 'border-amber-200 bg-amber-50 shadow-amber-200/60 dark:border-amber-300/30 dark:bg-amber-950/25 dark:shadow-amber-950/20',
    accent: 'bg-amber-400',
  },
  {
    card: 'border-emerald-200 bg-emerald-50 shadow-emerald-200/60 dark:border-emerald-400/30 dark:bg-emerald-950/30 dark:shadow-emerald-950/20',
    accent: 'bg-emerald-500',
  },
  {
    card: 'border-orange-200 bg-orange-50 shadow-orange-200/60 dark:border-orange-400/30 dark:bg-orange-950/30 dark:shadow-orange-950/20',
    accent: 'bg-orange-500',
  },
];

const exploreLinks = [
  {
    href: '/about',
    title: 'About the Festival',
    eyebrow: 'Mission and organizers',
    body: 'Learn about the organizers, mission, and people behind the Trust and Safety India Festival.',
    Icon: Info,
  },
  {
    href: '/programme',
    title: 'Programme',
    eyebrow: 'Panels and workshops',
    body: 'Explore panels, workshops, keynotes, firesides, and session themes across the festival agenda.',
    Icon: CalendarDays,
  },
  {
    href: '/speakers',
    title: 'Speakers',
    eyebrow: 'Expert voices',
    body: 'Meet the experts, policymakers, platform leaders, researchers, and advocates featured at TASI.',
    Icon: Mic,
  },
  {
    href: '/register',
    title: 'Register',
    eyebrow: 'Attend TASI 2026',
    body: 'Apply to attend the 2026 edition of the Trust and Safety India Festival in New Delhi.',
    Icon: Ticket,
  },
];

const proofPoints = [
  { value: '500+', label: 'participants in 2025' },
  { value: '100+', label: 'expert speakers' },
  { value: '15', label: 'countries represented' },
  { value: '30+', label: 'sessions and workshops' },
];

const heroPhotos = [
  {
    src: '/img/home-gallery/7T7A5237-new.webp',
    alt: 'Panel conversation at Trust and Safety India Festival',
    className: 'col-span-2',
  },
  {
    src: '/img/home-gallery/IMG_6768.webp',
    alt: 'Workshop participants at Trust and Safety India Festival',
    className: '',
  },
  {
    src: '/img/home-gallery/7T7A3087.webp',
    alt: 'Reception and networking moment at Trust and Safety India Festival',
    className: '',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Trust and Safety India Festival',
      description: pageDescription,
      isPartOf: {
        '@id': `${siteUrl}/#website`,
      },
      mainEntity: {
        '@id': `${siteUrl}/#event`,
      },
      about: focusAreas.map((name) => ({
        '@type': 'Thing',
        name,
      })),
    },
    {
      '@type': 'Event',
      '@id': `${siteUrl}/#event`,
      name: 'Trust and Safety India Festival',
      alternateName: [
        'Trust and Safety India Festival 2026',
        'TASI 2026',
        'TASI India',
      ],
      description: pageDescription,
      startDate: '2026-10-13',
      endDate: '2026-10-14',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      image: [
        `${siteUrl}/opengraph-image`,
        `${siteUrl}/img/home-gallery/7T7A5237-new.webp`,
        `${siteUrl}/img/home-gallery/IMG_6768.webp`,
      ],
      url: siteUrl,
      organizer: [
        {
          '@type': 'Organization',
          name: 'Centre for Social Research',
          url: 'https://www.csrindia.org',
        },
        {
          '@type': 'Organization',
          name: 'Trust and Safety Festival',
          url: 'https://trustandsafetyfestival.org',
        },
      ],
      location: {
        '@type': 'Place',
        name: 'India Habitat Centre',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'New Delhi',
          addressCountry: 'IN',
        },
      },
      offers: {
        '@type': 'Offer',
        name: 'Trust and Safety India Festival registration',
        url: `${siteUrl}/register`,
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-05-01T00:00:00+05:30',
      },
    },
    {
      '@type': 'ItemList',
      '@id': `${pageUrl}#focus-areas`,
      name: 'Trust and Safety India Festival focus areas',
      itemListElement: focusAreas.map((name, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
      })),
    },
  ],
};

export default function TrustAndSafetyIndiaFestivalPage() {
  return (
    <>
      <JsonLdScript data={structuredData} />
      <BreadcrumbJsonLd
        items={[{ name: 'Trust and Safety India Festival', url: pagePath }]}
      />
      <HomeNavbar />
      <main className="bg-white text-stone-950 dark:bg-stone-950 dark:text-white">
        <BrandedPageHero className="min-h-[360px] py-16 md:min-h-[430px] md:py-24">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              Evergreen Festival Overview
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Trust and Safety India Festival
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/90 md:text-lg">
              Trust and Safety India Festival is India&apos;s national platform
              for trust and safety, online safety, responsible AI, platform
              accountability, child safety, digital rights, and safer technology
              ecosystems.
            </p>
          </div>
        </BrandedPageHero>

        <section className="relative bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] px-6 py-section-sm text-white md:px-6 md:py-section-md lg:px-16 lg:py-section-lg">
          <div className="mx-auto grid w-full max-w-[1300px] items-stretch gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                  At a Glance
                </p>
                <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                  A convening already in motion.
                </h2>
                <p className="mt-5 text-base leading-8 text-white/78">
                  The Trust and Safety India Festival connects panels,
                  workshops, receptions, and focused conversations into one
                  national platform for safer digital systems.
                </p>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {proofPoints.map((point) => (
                  <div
                    key={point.label}
                    className="rounded-[10px] border border-white/10 bg-white/5 p-5"
                  >
                    <p className="text-4xl font-black leading-none text-rc-secondary dark:text-white">
                      {point.value}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/75">
                      {point.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid h-full min-h-[430px] grid-cols-2 grid-rows-[1.15fr_0.85fr] gap-3 lg:min-h-0">
              {heroPhotos.map((photo, index) => (
                <figure
                  key={photo.src}
                  className={`relative min-h-[160px] overflow-hidden rounded-[10px] border border-white/15 bg-white/10 shadow-2xl shadow-black/20 lg:min-h-0 ${photo.className}`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes={
                      index === 0
                        ? '(max-width: 1024px) 100vw, 720px'
                        : '(max-width: 1024px) 50vw, 350px'
                    }
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_35%,rgba(0,0,0,0.58)_100%)]" />
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-section-md md:px-6 md:py-section-lg">
          <div className="mx-auto grid w-full max-w-6xl items-stretch gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-rc-secondary">
                  What It Is
                </p>
                <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                  A year-round signal for India&apos;s trust and safety
                  community.
                </h2>
              </div>
              <div className="mt-7 space-y-5 text-base leading-8 text-stone-700 dark:text-stone-300">
                <p>
                  The Trust and Safety India Festival, also known as TASI,
                  brings together government, industry, civil society, academia,
                  media, and international partners to advance safer digital
                  systems.
                </p>
                <p>
                  The 2026 edition returns to New Delhi on October 13-14, 2026,
                  but the festival identity is broader than one year. It is a
                  shared platform for practical collaboration on online harms,
                  platform governance, AI safety, and digital rights.
                </p>
                <p>
                  Convened by the Centre for Social Research and Trust and
                  Safety Festival, the event keeps Indian realities and Global
                  South perspectives central to global trust and safety
                  conversations.
                </p>
              </div>
            </div>
            <figure className="relative min-h-[360px] overflow-hidden rounded-[10px] bg-stone-200 shadow-xl shadow-stone-200/50 dark:bg-stone-900 dark:shadow-black/30 lg:min-h-0">
              <Image
                src="/img/home-gallery/7T7A2715.webp"
                alt="Trust and Safety India Festival audience and session hall"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.78)_100%)] px-5 pb-5 pt-14 text-sm font-semibold text-white">
                Convening India&apos;s trust and safety ecosystem in one shared
                room.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="bg-stone-50 px-4 py-section-md dark:bg-stone-900 md:px-6 md:py-section-lg">
          <div className="mx-auto w-full max-w-6xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
              Festival Themes
            </p>
            <h2 className="max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
              What Trust and Safety India Festival covers
            </h2>
            <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {focusAreas.map((area, index) => {
                const theme = themeCardStyles[index % themeCardStyles.length];

                return (
                  <article
                    key={area}
                    className={`rounded-[10px] border p-6 shadow-lg transition-transform duration-200 hover:-translate-y-1 ${theme.card}`}
                  >
                    <span
                      className={`mb-5 block h-1.5 w-16 rounded-full ${theme.accent}`}
                    />
                    <h3 className="text-xl font-black tracking-tight text-stone-950 dark:text-white">
                      {area}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-stone-700 dark:text-stone-200">
                      A core part of the Trust and Safety India Festival
                      conversation, connecting policy, product, research, and
                      lived experience.
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[linear-gradient(135deg,#15002b_0%,#360454_52%,#5c0f4f_100%)] px-4 py-section-md text-white md:px-6 md:py-section-lg">
          <div className="mx-auto w-full max-w-6xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/60">
              Explore TASI
            </p>
            <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">
              Continue through the Trust and Safety India Festival site
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
              Move from the festival overview into the pages that carry the full
              story: context, agenda, people, and registration.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {exploreLinks.map((link, index) => {
                const Icon = link.Icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.055] p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-rc-secondary/70 hover:bg-white/[0.09]"
                  >
                    <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-rc-secondary/90 to-transparent" />
                    <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_45%)] opacity-70" />
                    <div className="relative flex items-start justify-between gap-5">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white/70">
                          0{index + 1} / {link.eyebrow}
                        </p>
                        <h3 className="mt-4 text-2xl font-black tracking-tight text-white">
                          {link.title}
                        </h3>
                      </div>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-white/15 bg-white/10 text-rc-secondary transition-colors group-hover:border-rc-secondary/60 group-hover:bg-rc-secondary group-hover:text-stone-950">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="relative mt-8">
                      <p className="max-w-xl text-sm leading-7 text-white/74">
                        {link.body}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-white">
                        <span>Open</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
