import Image from 'next/image';
import HomeNavbar from '@/components/home/navbar';
import SpeakerApplicationForm from '@/components/speakers/speaker-application-form';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import {
  speakerApplicationHero,
  speakerApplicationMediaLogos,
  speakerApplicationPrompt,
  speakerApplicationProofPoints,
  speakerHighlightSeeds,
} from '@/data/speaker-application-page';
import { speakers } from '@/data/speakers';

function buildSpeakerHighlights() {
  return speakerHighlightSeeds.map((highlight) => {
    const speakerData = speakers.find(
      (speaker) =>
        speaker.name === highlight.name ||
        (highlight.searchName && speaker.name === highlight.searchName)
    );

    return {
      name: highlight.name,
      title: speakerData
        ? speakerData.designation
        : highlight.defaultRole || 'Speaker',
      image: `/img/Speaker Highlights/${highlight.file}`,
    };
  });
}

export default function SpeakerApplicationPage() {
  const speakerHighlights = buildSpeakerHighlights();

  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] pb-20 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {speakerApplicationHero.eyebrow}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {speakerApplicationHero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              {speakerApplicationHero.description}
            </p>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-12 max-w-6xl px-6 sm:mt-14 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:items-stretch">
            <div className="flex h-full flex-col rounded-[10px] border border-stone-200/80 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
                Why Speak
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
                Join a stage built for substance
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-slate-300">
                TASI brings together policymakers, platforms, researchers,
                safety teams, educators, advocates, and digital rights leaders.
                We are especially interested in proposals grounded in practice,
                evidence, and lived experience.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {speakerApplicationProofPoints.map((item) => (
                  <div
                    key={item}
                    className="rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm font-medium leading-relaxed text-stone-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <div className="rounded-[10px] bg-[linear-gradient(135deg,#111827,#1f2937,#7c2d12)] px-5 py-5 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-200">
                    {speakerApplicationPrompt.eyebrow}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">
                    {speakerApplicationPrompt.body}
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
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
              They&apos;ve Spoken at TASI
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
              Voices that shaped the room
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {speakerHighlights.map((speaker) => (
              <article
                key={speaker.name}
                className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative aspect-[3/4] bg-stone-200">
                  <Image
                    src={speaker.image}
                    alt={speaker.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="p-3.5">
                  <h3 className="text-base font-black tracking-tight text-stone-950 dark:text-white">
                    {speaker.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-slate-300">
                    {speaker.title}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6 sm:px-8">
          <div className="rounded-[10px] border border-stone-200 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:px-10">
            <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
              Media Reach
            </p>
            <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
              A conversation that travels beyond the venue
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {speakerApplicationMediaLogos.map((logo) => (
                <div
                  key={logo.alt}
                  className="flex h-24 items-center justify-center rounded-[10px] border border-stone-200 bg-stone-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={140}
                    height={52}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
