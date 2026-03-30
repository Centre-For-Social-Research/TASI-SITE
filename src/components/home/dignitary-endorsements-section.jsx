import Image from 'next/image';

// Star/particle texture as an SVG data URL — placed over the gradient background
const STARS_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Ccircle cx='18' cy='22' r='1.1' fill='white' opacity='0.35'/%3E%3Ccircle cx='72' cy='10' r='0.8' fill='white' opacity='0.2'/%3E%3Ccircle cx='140' cy='40' r='1.3' fill='white' opacity='0.25'/%3E%3Ccircle cx='210' cy='18' r='0.9' fill='white' opacity='0.3'/%3E%3Ccircle cx='280' cy='55' r='1' fill='white' opacity='0.2'/%3E%3Ccircle cx='340' cy='25' r='1.2' fill='white' opacity='0.28'/%3E%3Ccircle cx='390' cy='70' r='0.8' fill='white' opacity='0.18'/%3E%3Ccircle cx='55' cy='80' r='1' fill='white' opacity='0.22'/%3E%3Ccircle cx='120' cy='95' r='1.4' fill='white' opacity='0.15'/%3E%3Ccircle cx='190' cy='75' r='0.8' fill='white' opacity='0.3'/%3E%3Ccircle cx='255' cy='110' r='1.1' fill='white' opacity='0.2'/%3E%3Ccircle cx='320' cy='85' r='0.9' fill='white' opacity='0.25'/%3E%3Ccircle cx='375' cy='130' r='1' fill='white' opacity='0.18'/%3E%3Ccircle cx='30' cy='150' r='1.2' fill='white' opacity='0.28'/%3E%3Ccircle cx='95' cy='165' r='0.8' fill='white' opacity='0.2'/%3E%3Ccircle cx='165' cy='140' r='1' fill='white' opacity='0.22'/%3E%3Ccircle cx='230' cy='175' r='1.3' fill='white' opacity='0.15'/%3E%3Ccircle cx='295' cy='155' r='0.9' fill='white' opacity='0.3'/%3E%3Ccircle cx='355' cy='190' r='1.1' fill='white' opacity='0.2'/%3E%3Ccircle cx='10' cy='220' r='0.8' fill='white' opacity='0.25'/%3E%3Ccircle cx='80' cy='240' r='1.2' fill='white' opacity='0.18'/%3E%3Ccircle cx='150' cy='210' r='1' fill='white' opacity='0.28'/%3E%3Ccircle cx='220' cy='250' r='0.9' fill='white' opacity='0.22'/%3E%3Ccircle cx='290' cy='225' r='1.4' fill='white' opacity='0.15'/%3E%3Ccircle cx='360' cy='255' r='1' fill='white' opacity='0.2'/%3E%3Ccircle cx='398' cy='200' r='0.8' fill='white' opacity='0.3'/%3E%3Ccircle cx='45' cy='285' r='1.1' fill='white' opacity='0.2'/%3E%3Ccircle cx='175' cy='290' r='0.8' fill='white' opacity='0.25'/%3E%3Ccircle cx='310' cy='295' r='1.2' fill='white' opacity='0.18'/%3E%3C/svg%3E")`;

// Add endorsements here. Use background-removed PNG images for best results.
const endorsements = [
  {
    name: 'Shri Narendra Modi',
    title: 'Hon\u2019ble Prime Minister of India',
    quote:
      'India looks forward to welcoming the world to the AI Impact Summit in February 2026. We have picked the theme of Sarvajana Hitaya, Sarvajana Sukhaya or welfare for all, happiness for all.',
    imageSrc: '/img/speakers/pm-modi-cutout.png',
    imageAlt: 'Shri Narendra Modi',
  },
];

export default function DiginitaryEndorsementsSection() {
  if (!endorsements.length) return null;
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-5xl space-y-5">
        {endorsements.map((person) => (
          <EndorsementCard key={person.name} {...person} />
        ))}
      </div>
    </section>
  );
}

function EndorsementCard({ name, title, quote, imageSrc, imageAlt }) {
  return (
    <div
      className="relative overflow-hidden rounded-[10px] shadow-xl"
      style={{
        background:
          'linear-gradient(135deg, #1e246e 0%, #141852 40%, #0c1038 100%)',
        backgroundImage: `${STARS_SVG}, linear-gradient(135deg, #1e246e 0%, #141852 40%, #0c1038 100%)`,
      }}
    >
      {/* Left accent line */}
      <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-[10px] bg-gradient-to-b from-white/20 via-white/5 to-transparent" />

      <div className="relative flex min-h-[220px] items-center py-10 pl-10 pr-10 md:pl-14 md:pr-[280px] lg:pr-[320px]">
        {/* Text block */}
        <div className="w-full max-w-[640px]">
          {/* Name + title */}
          <div>
            <h3 className="text-[1.35rem] font-bold leading-tight text-white md:text-[1.6rem]">
              {name}
            </h3>
            <p className="mt-0.5 text-[13px] italic text-blue-200/75">
              {title}
            </p>
          </div>

          {/* Quote block */}
          <div className="mt-6 flex items-start gap-3">
            {/* Opening quote mark */}
            <span
              aria-hidden="true"
              className="mt-[-6px] flex-shrink-0 font-serif text-[3rem] leading-none text-white/40 select-none"
            >
              &ldquo;
            </span>
            <p className="text-[14px] leading-[1.75] text-white/90 md:text-[15px]">
              {quote}
            </p>
          </div>

          {/* Closing quote mark — right-aligned */}
          <div className="mt-1 flex justify-end">
            <span
              aria-hidden="true"
              className="font-serif text-[3rem] leading-none text-white/40 select-none"
            >
              &rdquo;
            </span>
          </div>
        </div>

        {/* Portrait — anchored to bottom-right, needs background-removed PNG */}
        <div className="pointer-events-none absolute bottom-0 right-6 h-[110%] w-[220px] md:right-10 md:w-[260px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 768px) 180px, 260px"
          />
        </div>
      </div>
    </div>
  );
}
