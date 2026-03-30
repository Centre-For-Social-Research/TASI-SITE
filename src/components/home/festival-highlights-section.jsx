import { MotionReveal } from './motion-reveal';
import Link from 'next/link';

const MUX_EMBED_URL =
  'https://player.mux.com/WOZbrSwPSYqEFylGFgp5Z8qUGGvCRmJ3eVptCQZ1YSg?autoplay=true&muted=true&metadata-video-title=Trust+and+Safety+India+Festival+2025&video-title=Trust+and+Safety+India+Festival+2025';

export default function FestivalHighlightsSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] py-section-sm md:py-section-md lg:py-section-lg px-6 lg:px-16">
      <div className="mx-auto w-full max-w-[1300px]">
        {/* Top Nav Pills */}
        <div className="-mt-7 md:-mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-16 md:mb-20">
          {[
            { label: 'News', href: '/blog' },
            { label: 'Testimonials', href: '#video-testimonials' },
            { label: 'Speakers', href: '#speakers' },
            { label: 'Sponsors', href: '/sponsor' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full border-[1.5px] border-white px-5 py-1.5 md:px-6 md:py-2 text-[13px] md:text-sm font-bold text-white transition-all hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Content Two-Column Layout */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
          {/* Left Side: Text */}
          <div className="flex-1 text-white pr-0 lg:max-w-xl">
            <MotionReveal>
              <span className="text-xs md:text-sm font-black tracking-widest text-rc-secondary dark:text-white uppercase mb-4 block">
                TASI 2026 ANNOUNCEMENT
              </span>
              <h2 className="mb-8 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[3.2rem] text-white leading-[1.05]">
                India&apos;s Foremost{' '}
                <span className="text-rc-secondary dark:text-white">
                  Trust and Safety
                </span>{' '}
                Convening
              </h2>

              <div className="space-y-6 text-base md:text-[17px] font-normal leading-[1.6] text-white/90">
                <p>
                  The 2nd edition of India&apos;s leading summit on Trust,
                  Safety and AI Governance will take place on{' '}
                  <span className="font-bold text-white">
                    13-14 October 2026
                  </span>{' '}
                  in New Delhi.
                </p>
                <p>
                  We&apos;re incredibly excited to build on the momentum of TASI
                  2026, which brought together 500+ participants from 15
                  countries for two days of cross-sector dialogue, practical
                  collaboration, and 30+ sessions spanning AI governance, child
                  safety, policy, and digital wellbeing.
                </p>
                <p>
                  Convened by the Centre for Social Research and Trust and
                  Safety Festival, the event helps shape global conversations on
                  digital governance, ethics, and AI safety. Read about how
                  we&apos;re preparing for 2026.
                </p>
              </div>

              <Link
                href="/blog#tasi-2026-dates-announced"
                className="inline-block mt-10 text-[15px] font-bold text-rc-secondary dark:text-white underline decoration-[1.5px] underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-colors"
              >
                Read our announcement &rarr;
              </Link>
            </MotionReveal>
          </div>

          {/* Right Side: Video Card without yellow element */}
          <div className="flex-1 w-full relative">
            <MotionReveal delay={0.2} className="w-full">
              <div className="w-full overflow-hidden rounded-[10px] border border-white/5 bg-[#1b0d36] shadow-2xl">
                {/* Video container */}
                <div className="relative w-full aspect-video bg-black">
                  <iframe
                    src={MUX_EMBED_URL}
                    title="Trust and Safety India Festival Highlights"
                    className="absolute inset-0 h-full w-full border-0 object-cover"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* Text below video */}
                <div className="p-6 md:p-8">
                  <span className="text-[11px] md:text-xs font-black tracking-widest text-white/60 uppercase block mb-2">
                    TASI 2025 HIGHLIGHTS
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                    See What Happened at India&apos;s First Trust &amp; Safety
                    Festival
                  </h3>
                </div>
              </div>
            </MotionReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
