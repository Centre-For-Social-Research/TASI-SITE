import Link from 'next/link';
import TeamGrid from '@/components/about/team-grid';
import DiplomaticEndorsements from '@/components/about/diplomatic-endorsements';
import BreadcrumbJsonLd from '@/components/seo/breadcrumb-json-ld';
import JsonLdScript from '@/components/seo/json-ld-script';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import HomeNavbar from '@/components/home/navbar';
import { teamMembers } from '@/data/team-members';

export const revalidate = 86400;

const siteUrl = 'https://trustandsafetyindia.org';

export const metadata = {
  title: 'About Trust and Safety India Festival | TASI Organizers',
  description:
    "Learn about Trust and Safety India Festival (TASI), the Centre for Social Research, Trust and Safety Festival, and the organizing team behind India's trust and safety convening.",
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Trust and Safety India Festival | TASI Organizers',
    description:
      "Meet the organizers and mission behind TASI, India's convening for trust and safety, online safety, platform governance, and responsible AI.",
    url: '/about',
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Trust and Safety India Festival | TASI Organizers',
    description:
      'Meet the organizers and mission behind Trust and Safety India Festival.',
    images: ['/twitter-image'],
  },
};

const pillars = [
  {
    title: 'India-Led, Globally Relevant',
    body: 'TASI centers Indian realities and Global South perspectives in conversations on trust, safety, platform governance, and AI.',
  },
  {
    title: 'Policy Meets Practice',
    body: 'We connect public policy, platform operations, civil society expertise, and lived experience so ideas can move into implementation.',
  },
  {
    title: 'Safety With Equity',
    body: 'Women, children, youth, marginalized communities, and trust and safety workers remain central to how we frame digital well-being.',
  },
];

const whyIndiaCards = [
  {
    number: '01',
    title: 'Massive Digital Scale',
    body: 'From multilingual communication to high-volume platform participation, India experiences trust and safety challenges at a scale that can inform global thinking.',
  },
  {
    number: '02',
    title: 'Connected Harms',
    body: 'Online abuse, misinformation, child safety risks, and AI-enabled harms are deeply connected to offline inequalities and deserve locally grounded responses.',
  },
  {
    number: '03',
    title: 'Global Influence',
    body: 'What is designed, regulated, and tested in India increasingly shapes digital governance conversations far beyond its borders, especially across the Global South.',
    className: 'md:col-span-2',
  },
];

const conveningPartners = [
  {
    name: 'Trust and Safety Festival',
    body: [
      'The Trust and Safety Festival is a global platform bringing together technology companies, policymakers, researchers, and civil society to advance safer digital ecosystems through collaboration.',
      'Its partnership with TASI helps connect Indian priorities with international dialogue while keeping the work grounded in implementation and public interest.',
    ],
  },
  {
    name: 'Centre for Social Research',
    body: [
      "CSR has spent over four decades advancing gender justice, research, advocacy, and social change in India. Its digital safety work extends that mission into today's online realities.",
      'Through programs on online safety and well-being, CSR brings deep field knowledge, policy insight, and community-centered practice to the TASI platform.',
    ],
  },
];

const aboutCtaLinks = [
  {
    href: '/register',
    label: 'Register',
    className:
      'flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] px-8 py-2.5 text-[16px] font-bold leading-6 text-white transition-transform hover:scale-[1.02] hover:opacity-90 sm:min-w-[220px] sm:w-auto',
  },
  {
    href: '/contact',
    label: 'Contact us',
    className:
      'flex w-full items-center justify-center rounded-3xl border border-rc-primary bg-rc-primary px-8 py-2.5 text-[16px] font-bold leading-6 text-rc-primary-foreground transition-transform hover:scale-[1.02] hover:opacity-90 dark:border-white dark:bg-white dark:text-slate-950 sm:min-w-[220px] sm:w-auto',
  },
];

export default function AboutPage() {
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${siteUrl}/about#about`,
        url: `${siteUrl}/about`,
        name: 'About Trust and Safety India Festival',
        description: metadata.description,
        isPartOf: {
          '@id': `${siteUrl}/#website`,
        },
        mainEntity: {
          '@id': `${siteUrl}/#event`,
        },
      },
      {
        '@type': 'Event',
        '@id': `${siteUrl}/#event`,
        name: 'Trust and Safety India Festival 2026',
        alternateName: ['TASI 2026', 'Trust and Safety India Festival'],
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
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/about#organizers`,
        name: 'Trust and Safety India Festival organizing team',
        itemListElement: teamMembers.map((member, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Person',
            name: member.name,
            jobTitle: member.designation,
            description: member.bio,
            image: `${siteUrl}/img/team/${member.photo}`,
            sameAs: [member.linkedinUrl, member.twitterUrl].filter(Boolean),
          },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLdScript data={aboutJsonLd} />
      <BreadcrumbJsonLd items={[{ name: 'About', url: '/about' }]} />
      <HomeNavbar />
      <main className="bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="min-h-[300px] py-14 md:min-h-[360px] md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              About TASI
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              India&apos;s Foremost Trust and Safety Convening
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Learn more about the vision, partners, and purpose behind TASI
              2026 and the work shaping safer digital futures in India.
            </p>
          </div>
        </BrandedPageHero>

        <section className="relative bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] px-6 py-section-sm md:px-6 md:py-section-md lg:px-16 lg:py-section-lg">
          <div className="mx-auto grid w-full max-w-[1300px] gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div className="text-white">
              <span className="mb-4 block text-xs font-black uppercase tracking-widest text-rc-secondary dark:text-white md:text-sm">
                Why TASI Exists
              </span>
              <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-[3.2rem]">
                India needs a{' '}
                <span className="text-rc-secondary dark:text-white">
                  trust and safety
                </span>{' '}
                platform built for action.
              </h2>
              <div className="mt-8 space-y-6 text-base leading-[1.65] text-white/90 md:text-[17px]">
                <p>
                  India stands at the center of global digital transformation,
                  with one of the world&apos;s largest online populations,
                  rapidly evolving platform ecosystems, and rising public debate
                  around safety, AI, and accountability.
                </p>
                <p>
                  Yet many of the most consequential trust and safety frameworks
                  are still shaped without enough grounding in Indian realities
                  and Global South contexts. TASI helps close that gap by
                  bringing the right stakeholders into one shared space.
                </p>
                <p>
                  The goal is simple: move beyond parallel conversations and
                  toward sustained collaboration that can improve systems,
                  policy, and outcomes for people most affected by online harm.
                </p>
              </div>
            </div>

            <div className="grid gap-5">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-[10px] border border-white/10 bg-[#1b0d36] p-6 shadow-2xl"
                >
                  <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                    Core Focus
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-white/80">
                    {pillar.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-section-md dark:bg-[#121212] md:py-section-lg">
          <div className="container mx-auto max-w-[1300px] px-4 md:px-6">
            <p className="mb-2 text-body-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Why India, Why Now
            </p>
            <h2 className="mb-5 text-stone-900 text-display-lg font-black dark:text-white">
              Building Safer Digital Futures From India
            </h2>
            <p className="mb-10 max-w-3xl text-body-md leading-relaxed text-stone-700 dark:text-stone-300">
              India&apos;s scale, diversity, and digital momentum make it one of
              the most important places in the world to rethink how trust and
              safety is built, governed, and implemented.
            </p>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-6 md:grid-cols-2">
                {whyIndiaCards.map((card) => (
                  <article
                    key={card.title}
                    className={`rounded-[10px] border border-gray-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] p-7 shadow-lg shadow-stone-200/30 dark:border-gray-800 dark:bg-gray-900/50 ${card.className || ''}`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-rc-accent dark:text-white">
                      {card.number}
                    </p>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                      {card.body}
                    </p>
                  </article>
                ))}
              </div>

              <div className="rounded-[10px] bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_100%)] p-8 text-white shadow-xl shadow-[#350265]/20 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">
                  India&apos;s Role
                </p>
                <h3 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
                  A proving ground for trust, safety, and AI governance
                </h3>
                <p className="mt-5 text-base leading-relaxed text-white/85">
                  From multilingual communication to high-volume platform
                  participation, India experiences trust and safety challenges
                  at a scale that can inform global thinking.
                </p>
                <p className="mt-4 text-base leading-relaxed text-white/75">
                  TASI creates the connective space for policymakers, platforms,
                  researchers, and civil society to respond to that reality
                  together.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-section-md text-white md:py-section-lg">
          <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(35,0,52,0.97)_6%,rgba(92,15,79,0.9)_34%,rgba(126,8,58,0.68)_52%,rgba(0,0,0,0.3)_100%)]" />
          <div className="relative mx-auto grid w-full max-w-[1300px] gap-6 px-4 md:px-6 lg:grid-cols-2">
            {conveningPartners.map((partner) => (
              <article
                key={partner.name}
                className="rounded-[10px] border border-white/10 bg-white/10 p-8 backdrop-blur-sm"
              >
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-rc-secondary dark:text-white">
                  Convening Partner
                </p>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  {partner.name}
                </h2>
                {partner.body.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={`${index === 0 ? 'mt-5' : 'mt-4'} text-base leading-relaxed text-white/85`}
                  >
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <TeamGrid />
        <DiplomaticEndorsements />

        <section className="w-full border-t border-gray-100 bg-white px-4 py-section-sm dark:border-gray-800 dark:bg-gray-900 md:py-section-md">
          <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-center">
            <h2 className="bg-gradient-to-r from-[#350265] to-[#ffd919] dark:from-white dark:to-orange-300 bg-clip-text pb-2 text-center text-4xl font-semibold tracking-tight text-transparent md:text-5xl lg:text-[4rem]">
              Be Part of the Conversation
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-lg font-normal leading-relaxed text-gray-800 dark:text-gray-200 md:text-[22px]">
              Join delegates, experts, and institutions shaping the future of
              digital trust, safety, and AI governance in India and beyond.
            </p>
            <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
              {aboutCtaLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={link.className}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
