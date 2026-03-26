import Image from "next/image";
import { partners } from "@/data/partners";

export default function PartnersMarqueeStrip() {
  const remainderMd = partners.length % 4;
  const remainderLg = partners.length % 6;

  function getPlacementClasses(index) {
    const classes = [];

    if (remainderMd === 2) {
      if (index === partners.length - 2) classes.push("md:col-start-2");
      if (index === partners.length - 1) classes.push("md:col-start-3");
    }

    if (remainderLg === 2) {
      if (index === partners.length - 2) classes.push("lg:col-start-3");
      if (index === partners.length - 1) classes.push("lg:col-start-4");
    }

    return classes.join(" ");
  }

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[linear-gradient(180deg,#160325_0%,#26053a_46%,#4f0d53_100%)] py-12 text-white md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,217,25,0.14),transparent_40%)]" />
      <div className="relative mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-secondary dark:text-white">Our Network</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">Partners from TASI 2025</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-base">
            A growing network of organizations already shaping the trust and safety conversation around TASI.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((partner, index) => (
            <article
              key={partner.name}
              className={`forced-color-adjust-none [color-scheme:light] flex min-h-20 items-center justify-center rounded-[10px] border border-white/10 !bg-white px-3 py-3 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.65)] dark:!bg-white sm:min-h-24 sm:px-4 sm:py-4 ${getPlacementClasses(index)}`}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                loading="lazy"
                width={120}
                height={48}
                className="h-10 w-full object-contain sm:h-11"
                quality={80}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
