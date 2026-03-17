import Image from "next/image";
import { MotionReveal } from "./motion-reveal";

const ARCHIVE_LINK = "/past-editions";
const MUX_EMBED_URL =
  "https://player.mux.com/WOZbrSwPSYqEFylGFgp5Z8qUGGvCRmJ3eVptCQZ1YSg?autoplay=true&muted=true&metadata-video-title=Trust+and+Safety+India+Festival+2025&video-title=Trust+and+Safety+India+Festival+2025";
const PREVIEW_IMAGE = "/img/home-gallery/highlight-2.webp";

export default function FestivalHighlightsSection() {
  return (
    <section className="bg-[#1f110d]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-5 md:rounded-[16px] md:border md:border-white/8 md:bg-[#0a0b14] md:p-5 md:shadow-[0_25px_60px_rgba(0,0,0,0.35)] md:grid-cols-[minmax(0,1.9fr)_minmax(300px,0.72fr)] md:items-stretch">
            <MotionReveal>
              <div className="relative overflow-hidden rounded-[12px] border border-white/6 bg-[#0e1015]">
                <div className="relative aspect-video min-h-[200px] bg-[#0e1222] md:aspect-[16/10] md:min-h-[420px] xl:min-h-[640px]">
                  <iframe
                    src={MUX_EMBED_URL}
                    title="Trust and Safety India Festival 2025"
                    className="h-full w-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </MotionReveal>

            <MotionReveal delay={0.08} className="h-full">
              <aside className="flex h-full flex-col rounded-[12px] border border-white/6 bg-[#16101f] p-5 text-white">
                <div className="relative hidden overflow-hidden rounded-[10px] md:flex">
                  <Image
                    src={PREVIEW_IMAGE}
                    alt="TASI 2025 audience preview"
                    width={400}
                    height={176}
                    className="h-36 w-full object-cover md:h-44"
                    loading="lazy"
                    quality={85}
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.14)_100%)]" />
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-100/75">
                    TASI 2025 Highlights
                  </p>
                  <h2 className="mt-3 text-2xl font-black leading-[1.1] tracking-tight text-white md:text-[2rem]">
                    See What Happened at India&apos;s First Trust &amp; Safety Festival
                  </h2>
                  <p className="mt-5 text-base leading-8 text-white/82 md:text-lg">
                    TASI 2025 brought together 500+ participants from 15 countries for two days of cross-sector dialogue,
                    practical collaboration, and 30+ sessions spanning AI governance, child safety, policy, and digital wellbeing.
                  </p>
                </div>
              </aside>
            </MotionReveal>
        </div>
      </div>
    </section>
  );
}