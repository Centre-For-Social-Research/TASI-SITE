import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CountUpNumber from '@/components/ui/count-up-number';
import { getBlogPosts } from '@/lib/blog';
import SponsorsStripCarousel from './sponsors-strip-carousel';

const tasiStats = [
  { value: 500, suffix: '+', label: 'Participants Attended (2025)' },
  { value: 100, suffix: '+', label: 'Expert Speakers' },
  { value: 15, suffix: '', label: 'Countries Represented' },
  { value: 32, suffix: '', label: 'Partner Organisations' },
  { value: 30, suffix: '+', label: 'Sessions (Panels, Workshops)' },
  { value: 10, suffix: '+', label: 'Dedicated Workshops' },
];

export default async function NewsUpdatesSection() {
  const blogPosts = await getBlogPosts();
  const newsItems = blogPosts.slice(0, 4).map((post) => ({
    id: post.id,
    category: post.category,
    date: post.date,
    title: post.title,
    description: post.excerpt,
    image: post.image,
    link: post.sourceUrl || `/blog/${post.slug}`,
    external: Boolean(post.sourceUrl),
  }));

  return (
    <section className="py-section-md md:py-section-lg bg-white dark:bg-[#121212] text-black dark:text-white">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-widest text-rc-primary dark:text-white uppercase mb-3">
              News & Updates
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight">
              The Latest from TASI
            </h3>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background dark:bg-transparent h-11 px-8 rounded-full border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            SEE ALL HIGHLIGHTS
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsItems.map((item) => {
            const cardContent = (
              <>
                <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={1600}
                      height={900}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-4 text-xs font-semibold">
                    <span className="rounded-[10px] bg-rc-primary/10 px-3 py-1 text-rc-primary dark:bg-white/15 dark:text-white">
                      {item.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.date}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold mb-3 group-hover:text-rc-primary dark:group-hover:text-white transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-grow line-clamp-3">
                    {item.description}
                  </p>
                  <div className="mt-auto flex items-center text-sm font-bold text-rc-primary dark:text-white group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </>
            );

            if (item.external) {
              return (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-gray-200 bg-gray-50/50 transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50"
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.link}
                className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-gray-200 bg-gray-50/50 transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>

        <section
          aria-label="About TASI"
          className="relative left-1/2 right-1/2 mt-10 -ml-[50vw] -mr-[50vw] h-[420px] w-screen overflow-hidden text-white md:mt-14 md:h-[560px]"
        >
          <div
            className="news-updates-image absolute inset-0"
            aria-hidden="true"
          />
          <div className="news-updates-overlay pointer-events-none absolute inset-0" />

          <div className="absolute inset-0 z-10 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
              <div className="w-full max-w-xl">
                <p className="mb-6 text-[46px] font-black leading-[51px] tracking-tight text-white">
                  About Us
                </p>
                <div className="max-w-lg text-sm leading-relaxed text-white/95 md:text-base">
                  <p>
                    The Trust and Safety India Festival (TASI) is India&apos;s
                    first national convening focused on trust and safety, led by
                    civil society. Convened by the Centre for Social Research
                    (CSR) and Trust and Safety Festival, TASI creates a
                    collaborative space for dialogue across government,
                    industry, academia, and civil society. The festival advances
                    innovation while centering safety and wellbeing, especially
                    for women, children, and marginalised communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-0 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] py-10 md:py-12">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <p className="mb-5 text-xs md:text-sm font-semibold uppercase tracking-[0.14em] text-white/75">
              TASI in Numbers
            </p>
            <div className="flex flex-nowrap items-start gap-10 overflow-x-auto pb-2 md:gap-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tasiStats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[180px] md:min-w-[200px]"
                >
                  <CountUpNumber
                    end={stat.value}
                    suffix={stat.suffix}
                    className="text-5xl md:text-6xl font-black leading-none text-white"
                  />
                  <p className="mt-2 text-sm md:text-base font-semibold uppercase tracking-[0.08em] leading-snug text-rc-secondary dark:text-white">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SponsorsStripCarousel />
      </div>
    </section>
  );
}
