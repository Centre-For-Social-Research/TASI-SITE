import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

const audienceGroups = [
  'Government and policy leaders shaping digital governance',
  'Technology platforms, trust and safety teams, and product leaders',
  'Civil society organizations working with women, children, and communities',
  'Researchers, academics, journalists, creators, and safety advocates',
];

const exploreLinks = [
  {
    href: '/about',
    title: 'About the Festival',
    body: 'Learn about the organizers, mission, and people behind the Trust and Safety India Festival.',
  },
  {
    href: '/programme',
    title: 'Programme',
    body: 'Explore panels, workshops, keynotes, firesides, and session themes across the festival agenda.',
  },
  {
    href: '/speakers',
    title: 'Speakers',
    body: 'Meet the experts, policymakers, platform leaders, researchers, and advocates featured at TASI.',
  },
  {
    href: '/register',
    title: 'Register',
    body: 'Apply to attend the 2026 edition of the Trust and Safety India Festival in New Delhi.',
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
    className: 'col-span-2 aspect-[16/9]',
  },
  {
    src: '/img/home-gallery/IMG_6768.webp',
    alt: 'Workshop participants at Trust and Safety India Festival',
    className: 'aspect-[4/3]',
  },
  {
    src: '/img/home-gallery/7T7A3087.webp',
    alt: 'Reception and networking moment at Trust and Safety India Festival',
    className: 'aspect-[4/3]',
  },
];

const visualMoments = [
  {
    src: '/img/home-gallery/7T7A5002.webp',
    alt: 'Government and regulatory delegates at TASI',
    label: 'Policy and Public Interest',
    title: 'High-trust conversations with decision-makers',
  },
  {
    src: '/img/home-gallery/7T7A5636.webp',
    alt: 'Industry leaders and participants at TASI',
    label: 'Industry and Platform Safety',
    title: 'Practical exchange across product, policy, and operations',
  },
  {
    src: '/img/home-gallery/7T7A9973.webp',
    alt: 'International delegations and diplomatic guests at TASI',
    label: 'Global South Leadership',
    title: 'International dialogue grounded in Indian realities',
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
        <BrandedPageHero className="min-h-[520px] py-16 md:py-24">
          <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="text-center lg:text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                Evergreen Festival Overview
              </p>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                Trust and Safety India Festival
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/90 md:text-lg lg:mx-0">
                Trust and Safety India Festival is India&apos;s national
                platform for trust and safety, online safety, responsible AI,
                platform accountability, child safety, digital rights, and safer
                technology ecosystems.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
                {proofPoints.slice(0, 2).map((point) => (
                  <div
                    key={point.label}
                    className="rounded-[10px] border border-white/25 bg-white/10 px-4 py-3 text-left backdrop-blur-sm"
                  >
                    <p className="text-2xl font-black leading-none text-white">
                      {point.value}
                    </p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
                      {point.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {heroPhotos.map((photo, index) => (
                <figure
                  key={photo.src}
                  className={`relative overflow-hidden rounded-[10px] border border-white/15 bg-white/10 shadow-2xl ${photo.className}`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    priority={index === 0}
                    sizes={
                      index === 0
                        ? '(max-width: 1024px) 100vw, 620px'
                        : '(max-width: 1024px) 50vw, 300px'
                    }
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_35%,rgba(0,0,0,0.58)_100%)]" />
                </figure>
              ))}
            </div>
          </div>
        </BrandedPageHero>

        <section className="bg-[#15002b] px-4 py-6 text-white md:px-6">
          <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </section>

        <section className="px-4 py-section-md md:px-6 md:py-section-lg">
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-rc-primary dark:text-rc-secondary">
                What It Is
              </p>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                A year-round signal for India&apos;s trust and safety community.
              </h2>
              <figure className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[10px] bg-stone-200 shadow-xl shadow-stone-200/50 dark:bg-stone-900 dark:shadow-black/30">
                <Image
                  src="/img/home-gallery/7T7A2715.webp"
                  alt="Trust and Safety India Festival audience and session hall"
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
                <figcaption className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.78)_100%)] px-5 pb-5 pt-14 text-sm font-semibold text-white">
                  Convening India&apos;s trust and safety ecosystem in one
                  shared room.
                </figcaption>
              </figure>
            </div>
            <div className="space-y-5 text-base leading-8 text-stone-700 dark:text-stone-300">
              <p>
                The Trust and Safety India Festival, also known as TASI, brings
                together government, industry, civil society, academia, media,
                and international partners to advance safer digital systems.
              </p>
              <p>
                The 2026 edition returns to New Delhi on October 13-14, 2026,
                but the festival identity is broader than one year. It is a
                shared platform for practical collaboration on online harms,
                platform governance, AI safety, and digital rights.
              </p>
              <p>
                Convened by the Centre for Social Research and Trust and Safety
                Festival, the event keeps Indian realities and Global South
                perspectives central to global trust and safety conversations.
              </p>
            </div>
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
              {focusAreas.map((area) => (
                <article
                  key={area}
                  className="rounded-[10px] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950"
                >
                  <h3 className="text-xl font-black tracking-tight">{area}</h3>
                  <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-300">
                    A core part of the Trust and Safety India Festival
                    conversation, connecting policy, product, research, and
                    lived experience.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_46%,#ef5700_100%)] px-4 py-section-md text-white md:px-6 md:py-section-lg">
          <div className="mx-auto w-full max-w-6xl">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/70">
                Festival in Motion
              </p>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                More than a conference page. A living convening.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/85">
                The Trust and Safety India Festival brings policy, platform,
                research, civil society, and international voices into formats
                built for exchange: panels, workshops, receptions, roundtables,
                and practical collaboration.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {visualMoments.map((moment) => (
                <article
                  key={moment.src}
                  className="overflow-hidden rounded-[10px] border border-white/15 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-sm"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={moment.src}
                      alt={moment.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-rc-secondary dark:text-white">
                      {moment.label}
                    </p>
                    <h3 className="mt-3 text-xl font-black tracking-tight">
                      {moment.title}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-section-md md:px-6 md:py-section-lg">
          <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[10px] bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_100%)] p-8 text-white md:p-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
                Who It Brings Together
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                A cross-sector platform for safer digital futures.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/85">
                Trust and Safety India Festival is built for the people and
                organizations responsible for reducing online harm, improving
                governance, and protecting users across digital ecosystems.
              </p>
              <figure className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[10px] border border-white/15">
                <Image
                  src="/img/home-gallery/7T7A9837.webp"
                  alt="Media and audience engagement at Trust and Safety India Festival"
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover"
                />
              </figure>
            </div>

            <div className="grid gap-4">
              {audienceGroups.map((group) => (
                <div
                  key={group}
                  className="rounded-[10px] border border-stone-200 bg-white p-5 text-base font-semibold leading-7 text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
                >
                  {group}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-white px-4 py-section-md dark:border-stone-800 dark:bg-stone-950 md:px-6 md:py-section-lg">
          <div className="mx-auto w-full max-w-6xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
              Explore TASI
            </p>
            <h2 className="max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
              Continue through the Trust and Safety India Festival site
            </h2>
            <div className="mt-9 grid gap-5 md:grid-cols-2">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-[10px] border border-stone-200 bg-stone-50 p-6 transition-colors hover:border-rc-primary dark:border-stone-800 dark:bg-stone-900"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-black tracking-tight">
                      {link.title}
                    </h3>
                    <ArrowRight className="h-5 w-5 shrink-0 text-rc-primary transition-transform group-hover:translate-x-1 dark:text-rc-secondary" />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-300">
                    {link.body}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
