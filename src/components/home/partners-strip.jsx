import Image from "next/image";
import { partners } from "@/data/partners";

export default function PartnersStrip() {
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
    <section className="border-y border-stone-200 bg-stone-50 py-10 md:py-12">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Our Network
        </p>
        <h2 className="mb-6 text-center text-2xl font-black tracking-tight text-stone-900 md:mb-8 md:text-4xl">
          Partners from TASI 2025
        </h2>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((partner, index) => (
            <article
              key={partner.name}
              className={`forced-color-adjust-none [color-scheme:light] flex min-h-16 items-center justify-center rounded-lg border border-stone-200 !bg-white px-2 py-2 dark:!border-stone-200 dark:!bg-white sm:min-h-20 sm:rounded-xl sm:px-3 sm:py-3 ${getPlacementClasses(index)}`}
              style={{ backgroundColor: "#ffffff", colorScheme: "light" }}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                loading="lazy"
                width={120}
                height={48}
                className="h-9 w-full object-contain sm:h-10"
                quality={80}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
