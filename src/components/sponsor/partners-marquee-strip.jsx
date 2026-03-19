import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { partners } from "@/data/partners";

function PartnerLogoCard({ partner }) {
  return (
    <article className="mx-2 flex h-20 w-40 items-center justify-center rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-sm sm:mx-3 sm:h-24 sm:w-52">
      <Image
        src={partner.logo}
        alt={partner.name}
        loading="lazy"
        width={140}
        height={56}
        className="h-10 w-full object-contain sm:h-12"
        quality={80}
      />
    </article>
  );
}

export default function PartnersMarqueeStrip() {
  return (
    <section className="border-y border-stone-200 bg-stone-50 py-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Our Network</p>
        <h2 className="mb-5 text-center text-2xl font-black tracking-tight text-stone-900 md:text-4xl">Partners from TASI 2025</h2>

        <Marquee pauseOnHover duration={30} className="py-2" fadeAmount={8}>
          {partners.map((partner) => (
            <PartnerLogoCard key={partner.name} partner={partner} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
