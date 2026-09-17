import Image from 'next/image';

export default function MediaAccreditationCallout() {
  return (
    <section
      id="media-accreditation"
      className="scroll-mt-32 bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_52%,#141c56_100%)] text-white"
    >
      <div className="mx-auto grid w-full max-w-7xl overflow-hidden lg:grid-cols-[1.04fr_0.96fr]">
        <div className="flex flex-col justify-center px-6 py-12 md:px-10 md:py-16 lg:px-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
            TASI 2026 Media
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Cover TASI 2026
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/88">
            Journalists, editors, broadcasters, news agencies, podcasters, and
            eligible freelance reporters can request media accreditation on a
            dedicated application page.
          </p>
          <div className="mt-7">
            <a
              href="/media/accreditation"
              className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#2d1748] transition hover:bg-stone-100"
            >
              Apply for media accreditation
            </a>
          </div>
        </div>

        <div className="relative min-h-[280px] lg:min-h-[420px]">
          <Image
            src="/img/hero-bg-2.png"
            alt="Delegates and media professionals at a TASI gathering"
            fill
            className="object-cover opacity-80"
            sizes="(min-width: 1024px) 48vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(53,2,101,0.2),rgba(20,28,86,0.08))]" />
        </div>
      </div>
    </section>
  );
}
