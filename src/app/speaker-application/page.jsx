import Image from "next/image";
import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";
import SpeakerApplicationForm from "@/components/speakers/speaker-application-form";
import BrandedPageHero from "@/components/ui/branded-page-hero";
import { speakers } from "@/data/speakers";

const homepageHighlights = [
  { name: "Dr. Subrahmanyam Jaishankar", file: "Dr. Subrahmanyam Jaishankar.png", searchName: "Dr. S Jaishankar", defaultRole: "Minister of External Affairs, Govt. of India" },
  { name: "S. Krishnan", file: "S. Krishnan.png", searchName: "S Krishnan", defaultRole: "Secretary, MeitY" },
  { name: "Abhishek Singh", file: "Abhishek Singh.png" },
  { name: "Jan Thesleff", file: "Jan Thesleff.png", defaultRole: "Ambassador of Sweden to India" },
  { name: "Marisa Gerards", file: "Marisa Gerards.png", defaultRole: "Ambassador of the Netherlands to India" },
  { name: "Thierry Mathou", file: "Thierry Mathou.png", defaultRole: "Ambassador of France to India" },
  { name: "Christopher Cooter", file: "Christopher Cooter.png", defaultRole: "High Commissioner of Canada" },
  { name: "Akash Pugalia", file: "Akash Pugalia.png" },
  { name: "Natasha Jog", file: "Natasha Jog.png" },
  { name: "Neda Niazian", file: "Neda Niazian.png" },
  { name: "Norman Ng", file: "Norman Ng.png" },
  { name: "Seema Jindal", file: "Seema Jindal.png" },
  { name: "Snigdha Bhardwaj", file: "Snigdha Bhardwaj.png" },
  { name: "Sunil Abraham", file: "Sunil Abraham.png" },
  { name: "Uthara Ganesh", file: "Uthara Ganesh.png" },
];

const proofPoints = [
  "Government, industry, civil society, academia, and creators on one stage",
  "A programme shaped around trust and safety, digital rights, AI governance, and online wellbeing",
  "An audience of practitioners looking for usable insights, not generic keynote filler",
  "A curation team that values lived experience, implementation detail, and policy relevance",
];

const mediaLogos = [
  { src: "/img/media-coverage/the-hindu.png", alt: "The Hindu" },
  { src: "/img/media-coverage/the-print.png", alt: "The Print" },
  { src: "/img/media-coverage/business-standard.png", alt: "Business Standard" },
  { src: "/img/media-coverage/financial-express.png", alt: "Financial Express" },
  { src: "/img/media-coverage/ani.png", alt: "ANI" },
  { src: "/img/media-coverage/dd-news.png", alt: "DD News" },
];

export const metadata = {
  title: "Apply to Speak at TASI 2026",
  description:
    "Submit your speaker application for TASI 2026 and help shape conversations on trust and safety, AI governance, child safety, and digital wellbeing.",
};

export default function SpeakerApplicationPage() {
  const speakerHighlights = homepageHighlights.map((highlight) => {
    const speakerData = speakers.find(
      (speaker) => speaker.name === highlight.name || (highlight.searchName && speaker.name === highlight.searchName),
    );

    return {
      name: highlight.name,
      title: speakerData ? speakerData.designation : (highlight.defaultRole || "Speaker"),
      image: `/img/Speaker Highlights/${highlight.file}`,
    };
  });

  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] pb-20 text-stone-900">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">TASI 2026</p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Apply to Speak at TASI 2026
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              Bring a sharp perspective, a real-world case study, or a conversation that can move the field forward.
              We are looking for speakers who can turn trust and safety challenges into actionable dialogue.
            </p>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-12 max-w-6xl px-6 sm:mt-14 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:items-stretch">
            <div className="flex h-full flex-col rounded-[2rem] border border-stone-200/80 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Why Speak</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                Join a stage built for substance
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
                TASI brings together policymakers, platforms, researchers, safety teams, educators, advocates, and
                digital rights leaders. We are especially interested in proposals grounded in practice, evidence, and
                lived experience.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {proofPoints.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm font-medium leading-relaxed text-stone-700"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#111827,#1f2937,#7c2d12)] px-5 py-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-200">What To Send</p>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  Share your proposed topic, the audience problem it addresses, and why your voice is relevant for
                  TASI 2026. Panels, firesides, solo talks, cross-sector case studies, and implementation-led sessions
                  are all welcome.
                </p>
                </div>
              </div>
            </div>

            <div className="h-full">
              <SpeakerApplicationForm />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6 sm:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">They've Spoken at TASI</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
              Voices that shaped the room
            </h2>
          </div>

          <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {speakerHighlights.map((speaker) => (
              <article
                key={speaker.name}
                className="overflow-hidden rounded-[1.35rem] border border-stone-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
              >
                <div className="relative aspect-[3/4] bg-stone-200">
                  <Image src={speaker.image} alt={speaker.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="p-3.5">
                  <h3 className="text-base font-black tracking-tight text-stone-950">{speaker.name}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{speaker.title}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6 sm:px-8">
          <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-10">
            <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-orange-700">Media Reach</p>
            <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
              A conversation that travels beyond the venue
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {mediaLogos.map((logo) => (
                <div
                  key={logo.alt}
                  className="flex h-24 items-center justify-center rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4"
                >
                  <Image src={logo.src} alt={logo.alt} width={140} height={52} className="h-10 w-auto object-contain" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}
