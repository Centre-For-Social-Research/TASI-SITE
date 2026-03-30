import Image from 'next/image';
import { partners } from '@/data/partners';

export default function PartnersStrip() {
  const remainderMd = partners.length % 4;
  const remainderLg = partners.length % 6;

  function getPlacementClasses(index) {
    const classes = [];

    if (remainderMd === 2) {
      if (index === partners.length - 2) classes.push('md:col-start-2');
      if (index === partners.length - 1) classes.push('md:col-start-3');
    }

    if (remainderLg === 2) {
      if (index === partners.length - 2) classes.push('lg:col-start-3');
      if (index === partners.length - 1) classes.push('lg:col-start-4');
    }

    return classes.join(' ');
  }

  return (
    <section className="bg-white py-16 font-['Inter',sans-serif] md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <h2 className="mb-12 text-center text-3xl font-black uppercase tracking-tight text-[#350265] md:mb-16 md:text-5xl">
          PARTNERS FROM <span className="text-[#ff6900]">TASI 2025</span>
        </h2>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((partner, index) => (
            <article
              key={partner.name}
              className={`forced-color-adjust-none [color-scheme:light] flex min-h-[5rem] items-center justify-center rounded-[10px] border-4 border-[#350265] bg-[#ffffff] px-2 py-3 shadow-[4px_4px_0px_#350265] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#350265] dark:bg-[#ffffff] sm:min-h-[6rem] sm:px-4 sm:py-4 ${getPlacementClasses(index)}`}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                loading="lazy"
                width={120}
                height={48}
                className="h-10 w-full object-contain grayscale transition duration-300 hover:grayscale-0 sm:h-12"
                quality={80}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
