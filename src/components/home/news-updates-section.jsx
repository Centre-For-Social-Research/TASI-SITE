import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import CountUpNumber from "../ui/count-up-number"
import SponsorsStripCarousel from "./sponsors-strip-carousel"

const newsItems = [
  {
    id: 1,
    category: "ANNOUNCEMENT",
    date: "Feb 15, 2026",
    title: "Call for Proposals Now Open",
    description: "Submit your proposals for sessions, panels, and workshops for TASI 2026. Join us in shaping the agenda for India's foremost trust and safety convening.",
    image: "/img/home-gallery/tasi-2026-brochure-3.png",
    link: "/"
  },
  {
    id: 2,
    category: "REGISTRATION",
    date: "Mar 01, 2026",
    title: "Early Bird Registration",
    description: "Secure your spot at TASI 2026 with our early bird rates. Don't miss out on the opportunity to connect with industry leaders.",
    image: "/img/home-gallery/7T7A0181.webp",
    link: "/"
  },
  {
    id: 3,
    category: "KEYNOTE",
    date: "Mar 15, 2026",
    title: "First Keynote Speakers Announced",
    description: "We are thrilled to announce our first lineup of keynote speakers featuring global experts in digital safety and policy.",
    image: "/img/home-gallery/7T7A0646.webp",
    link: "/"
  },
  {
    id: 4,
    category: "COMMUNITY",
    date: "Apr 05, 2026",
    title: "TASI Community Mixer",
    description: "Join our pre-conference virtual networking event to meet fellow attendees and discuss pressing trust and safety issues.",
    image: "/img/home-gallery/tasi-community-mixer.webp",
    link: "/"
  }
]

const tasiStats = [
  { value: 500, suffix: "+", label: "Participants Attended (2025)" },
  { value: 100, suffix: "+", label: "Expert Speakers" },
  { value: 15, suffix: "", label: "Countries Represented" },
  { value: 32, suffix: "", label: "Partner Organisations" },
  { value: 30, suffix: "+", label: "Sessions (Panels, Workshops)" },
  { value: 10, suffix: "+", label: "Dedicated Workshops" },
]

export default function NewsUpdatesSection() {
  return (
    <section className="py-section-md md:py-section-lg bg-white dark:bg-[#121212] text-black dark:text-white">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-widest text-rc-primary dark:text-white uppercase mb-3">News & Updates</h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight">The Latest from TASI</h3>
          </div>
          <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background dark:bg-transparent h-11 px-8 rounded-full border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
            SEE ALL HIGHLIGHTS
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsItems.map((item) => (
            <Link key={item.id} href={item.link} className="group flex flex-col h-full border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-gray-50/50 dark:bg-gray-900/50">
              <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4 text-xs font-semibold">
                  <span className="px-3 py-1 rounded-full bg-rc-primary/10 dark:bg-white/15 text-rc-primary dark:text-white">{item.category}</span>
                  <span className="text-gray-500 dark:text-gray-400">{item.date}</span>
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-rc-primary dark:group-hover:text-white transition-colors line-clamp-2">{item.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-grow line-clamp-3">{item.description}</p>
                <div className="mt-auto flex items-center text-sm font-bold text-rc-primary dark:text-white group-hover:gap-2 transition-all">
                  Read More <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="relative mt-10 md:mt-14 overflow-hidden min-h-[420px] md:min-h-[560px] text-white w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <Image
            src="/img/home-gallery/7t7a2717.jpg"
            alt="Trust and Safety India Festival community gathering"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(35, 0, 52, 0.97) 6%, rgba(92, 15, 79, 0.9) 34%, rgba(126, 8, 58, 0.68) 52%, rgba(0, 0, 0, 0.24) 74%, rgba(0, 0, 0, 0.14) 100%)",
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6 pt-16 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20">
            <div className="w-full max-w-xl">
              <p
                className="mb-6 text-[46px] leading-[51px] font-black tracking-tight text-white"
              >
                About Us
              </p>
              <div className="text-sm md:text-base leading-relaxed text-white/95 max-w-lg">
                <p>
                  The Trust and Safety India Festival (TASI) is India&apos;s first national convening focused on trust and safety, led by civil society. Convened by the Centre for Social Research (CSR) and Trust and Safety Festival, TASI creates a collaborative space for dialogue across government, industry, academia, and civil society. The festival advances innovation while centering safety and wellbeing, especially for women, children, and marginalised communities.
                </p>
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
                <p className="mt-2 text-sm md:text-base font-semibold uppercase tracking-[0.08em] leading-snug text-rc-secondary">
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
  )
}
