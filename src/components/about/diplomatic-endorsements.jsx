import Image from "next/image";

const STARS_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Ccircle cx='18' cy='22' r='1.1' fill='white' opacity='0.35'/%3E%3Ccircle cx='72' cy='10' r='0.8' fill='white' opacity='0.2'/%3E%3Ccircle cx='140' cy='40' r='1.3' fill='white' opacity='0.25'/%3E%3Ccircle cx='210' cy='18' r='0.9' fill='white' opacity='0.3'/%3E%3Ccircle cx='280' cy='55' r='1' fill='white' opacity='0.2'/%3E%3Ccircle cx='340' cy='25' r='1.2' fill='white' opacity='0.28'/%3E%3Ccircle cx='390' cy='70' r='0.8' fill='white' opacity='0.18'/%3E%3Ccircle cx='55' cy='80' r='1' fill='white' opacity='0.22'/%3E%3Ccircle cx='120' cy='95' r='1.4' fill='white' opacity='0.15'/%3E%3Ccircle cx='190' cy='75' r='0.8' fill='white' opacity='0.3'/%3E%3Ccircle cx='255' cy='110' r='1.1' fill='white' opacity='0.2'/%3E%3Ccircle cx='320' cy='85' r='0.9' fill='white' opacity='0.25'/%3E%3Ccircle cx='375' cy='130' r='1' fill='white' opacity='0.18'/%3E%3Ccircle cx='30' cy='150' r='1.2' fill='white' opacity='0.28'/%3E%3Ccircle cx='95' cy='165' r='0.8' fill='white' opacity='0.2'/%3E%3Ccircle cx='165' cy='140' r='1' fill='white' opacity='0.22'/%3E%3Ccircle cx='230' cy='175' r='1.3' fill='white' opacity='0.15'/%3E%3Ccircle cx='295' cy='155' r='0.9' fill='white' opacity='0.3'/%3E%3Ccircle cx='355' cy='190' r='1.1' fill='white' opacity='0.2'/%3E%3Ccircle cx='10' cy='220' r='0.8' fill='white' opacity='0.25'/%3E%3Ccircle cx='80' cy='240' r='1.2' fill='white' opacity='0.18'/%3E%3Ccircle cx='150' cy='210' r='1' fill='white' opacity='0.28'/%3E%3Ccircle cx='220' cy='250' r='0.9' fill='white' opacity='0.22'/%3E%3Ccircle cx='290' cy='225' r='1.4' fill='white' opacity='0.15'/%3E%3Ccircle cx='360' cy='255' r='1' fill='white' opacity='0.2'/%3E%3Ccircle cx='398' cy='200' r='0.8' fill='white' opacity='0.3'/%3E%3Ccircle cx='45' cy='285' r='1.1' fill='white' opacity='0.2'/%3E%3Ccircle cx='175' cy='290' r='0.8' fill='white' opacity='0.25'/%3E%3Ccircle cx='310' cy='295' r='1.2' fill='white' opacity='0.18'/%3E%3C/svg%3E")`;

const endorsements = [
  {
    name: "Dr. S Jaishankar",
    title: "External Affairs Minister, Government of India",
    quote:
      "India bears a special responsibility in shaping global conversations on technology. As nations look to us for inspiration, platforms such as the Trust and Safety India Festival become vital spaces for advancing responsible and inclusive AI.",
    imageSrc: "/img/endorsements/Dr. S Jaishankar.png",
    imageAlt: "Dr. S Jaishankar",
    imagePosition: "left",
  },
  {
    name: "Thierry Mathou",
    title: "Ambassador of France to India",
    quote:
      "The French Embassy in India is proud to support the Trust & Safety Festival, a crucial platform fostering global cooperation on digital safety and governance. Strengthening trust in digital spaces is essential for the future, and this festival brings together key stakeholders to advance meaningful solutions.",
    imageSrc: "/img/endorsements/Thierry Mathou.png",
    imageAlt: "Thierry Mathou",
    imagePosition: "right",
  },
  {
    name: "Christopher Cooter",
    title: "High Commissioner of Canada to India",
    quote:
      "Canada has been a valuable source of support to TASI, strengthening its growing role in global conversations on trust, safety, and responsible technology. This support reflects a shared commitment between Canada and India to advance AI innovation grounded in ethics, safety, and human rights.",
    imageSrc: "/img/endorsements/Christopher Cooter-2.png",
    imageAlt: "Christopher Cooter",
    imagePosition: "left",
    imageZoom: 1.35,
  },
  {
    name: "Marisa Gerards",
    title: "Ambassador of the Kingdom of the Netherlands to India",
    quote:
      "Conversations on trust and safety are more important than ever. Technology is moving incredibly fast on the digital highway, and if we do not begin with values as our starting point, we risk entering troubled waters. Convenings like this provide the space to reflect together, to align across sectors and to ensure that technology remains anchored in shared values.",
    imageSrc: "/img/endorsements/Marisa Gerards-2026.png",
    imageAlt: "Marisa Gerards",
    imagePosition: "right",
    imageZoom: 1.35,
  },
  {
    name: "Jan Thesleff",
    title: "Ambassador of Sweden to India",
    quote:
      "Sweden is honored to be a partner to the Trust & Safety Festival. This platform gathers key stakeholders in order to address the crucial challenges and possibilities associated with digital and emerging technologies through global cooperation. We are confident that this festival will help advancing the objective of fostering an open, safe, secure and sustainable digital future, not least with regard to the upcoming AI Impact Summit 2026 – a mile-stone event – hosted by the Government of India.",
    imageSrc: "/img/endorsements/Jan Thesleff.png",
    imageAlt: "Jan Thesleff",
    imagePosition: "left",
    imageZoom: 1.35,
  },
];

export default function DiplomaticEndorsements() {
  return (
    <section className="bg-white px-4 py-section-sm dark:bg-stone-950 md:py-section-md">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          Endorsements
        </p>
        <h2 className="mb-10 text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
          Voices of Support
        </h2>
        <div className="space-y-5">
          {endorsements.map((person) => (
            <EndorsementCard key={person.name} {...person} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EndorsementCard({ name, title, quote, imageSrc, imageAlt, imagePosition = "right", imageZoom = 1 }) {
  const photoLeft = imagePosition === "left";
  return (
    <div className="rounded-[10px] bg-slate-100 p-3 shadow-md dark:bg-slate-800">
    <div
      className="relative overflow-hidden rounded-[10px] shadow-xl"
      style={{
        background:
          "linear-gradient(135deg, #1e246e 0%, #141852 40%, #0c1038 100%)",
        backgroundImage: `${STARS_SVG}, linear-gradient(135deg, #1e246e 0%, #141852 40%, #0c1038 100%)`,
      }}
    >
      {/* Accent line — mirrors the photo side */}
      <div
        className={`absolute inset-y-0 w-[3px] rounded-[10px] bg-gradient-to-b from-white/20 via-white/5 to-transparent ${photoLeft ? "right-0" : "left-0"}`}
      />

      <div
        className={`relative flex min-h-[220px] items-center py-10 ${
          photoLeft
            ? "px-8 md:pl-[280px] md:pr-14 lg:pl-[320px]"
            : "px-8 md:pl-14 md:pr-[280px] lg:pr-[320px]"
        }`}
      >
        {/* Text */}
        <div className="w-full max-w-[640px]">
          <div>
            <h3 className="text-[1.35rem] font-bold leading-tight text-white md:text-[1.6rem]">
              {name}
            </h3>
            <p className="mt-0.5 text-[13px] italic text-blue-200/75">{title}</p>
          </div>

          <div className="mt-6 flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-[-6px] flex-shrink-0 select-none font-serif text-[3rem] leading-none text-white/40"
            >
              &ldquo;
            </span>
            <p className="text-[14px] leading-[1.75] text-white/90 md:text-[15px]">
              {quote}
            </p>
          </div>

          <div className="mt-1 flex justify-end">
            <span
              aria-hidden="true"
              className="select-none font-serif text-[3rem] leading-none text-white/40"
            >
              &rdquo;
            </span>
          </div>

          {/* Mobile-only portrait — shown inline below quote, hidden on desktop */}
          <div className="mt-6 flex justify-center md:hidden">
            <div className="relative h-[200px] w-[160px]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-contain object-bottom"
                sizes="160px"
              />
            </div>
          </div>
        </div>

        {/* Portrait — desktop only, absolutely positioned on the side */}
        <div
          className={`pointer-events-none absolute bottom-0 hidden h-[110%] w-[260px] md:block ${
            photoLeft ? "left-10" : "right-10"
          }`}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-contain object-bottom"
            style={{ transform: `scale(${imageZoom})`, transformOrigin: "bottom center" }}
            sizes="260px"
          />
        </div>
      </div>
    </div>
    </div>
  );
}
