import Image from 'next/image';
import HomeNavbar from '@/components/home/navbar';
import VolunteerApplicationForm from '@/components/volunteers/volunteer-application-form';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import {
  volunteerApplicationHero,
  volunteerBenefits,
  volunteerBestFits,
  volunteerGallery,
  volunteerProcessSteps,
  volunteerTracks,
} from '@/data/volunteer-application-page';

export default function VolunteerApplicationPage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe6_100%)] pb-20 text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#0b1220_100%)] dark:text-stone-100">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {volunteerApplicationHero.eyebrow}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {volunteerApplicationHero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
              {volunteerApplicationHero.description}
            </p>
          </div>
        </BrandedPageHero>

        <section className="mx-auto mt-8 max-w-6xl px-6 sm:mt-10 sm:px-8 lg:mt-12">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
            <div className="rounded-[10px] border border-stone-200/80 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
                Why Volunteer
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
                A meaningful role in a high-trust gathering
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-slate-300">
                TASI brings together public leaders, platforms, civil society,
                researchers, educators, and safety practitioners. Volunteers
                help shape the tone of the entire experience through
                hospitality, clarity, coordination, and care.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {volunteerBenefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <h3 className="text-base font-black tracking-tight text-stone-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[10px] bg-[linear-gradient(135deg,#111827,#1f2937,#7c2d12)] px-5 py-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-200">
                  Where You Can Help
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {volunteerTracks.map((track) => (
                    <div
                      key={track}
                      className="rounded-[10px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85"
                    >
                      {track}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <VolunteerApplicationForm />
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-6 sm:px-8">
          <div className="overflow-hidden rounded-[10px] border border-stone-200 bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_46%,#fff4e7_100%)] px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_46%,#1f2937_100%)] sm:px-8 sm:py-8">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                Inside The Festival
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
                Moments that show what volunteering really looks like
              </h2>
              <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-slate-300">
                These are the kinds of guest-facing, detail-heavy moments where
                volunteers shape the experience in real time.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {volunteerGallery.map((image) => (
                <article
                  key={image.src}
                  className="group relative overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className={`object-cover transition duration-500 group-hover:scale-[1.08] ${
                        image.imageClassName || 'scale-[1.05]'
                      }`}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-transparent px-5 pb-5 pt-14 text-white sm:px-6 sm:pb-6">
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-orange-200">
                        {image.eyebrow}
                      </p>
                      <p className="mt-2 text-lg font-black tracking-tight sm:text-2xl">
                        {image.title}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[10px] border border-stone-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
                Who Thrives Here
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
                Calm under pressure. Kind with people. Ready to pitch in.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-slate-300">
                You do not need to be an event professional. We care more about
                reliability, communication, and a thoughtful attitude than
                polished stage credentials.
              </p>
              <div className="mt-6 grid gap-3">
                {volunteerBestFits.map((item) => (
                  <div
                    key={item}
                    className="rounded-[10px] border border-stone-200 bg-[#fff8ef] px-4 py-4 text-sm font-medium leading-relaxed text-stone-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-stone-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
                How It Works
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
                A simple application and coordination process
              </h2>
              <div className="mt-8 grid gap-4">
                {volunteerProcessSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-4 rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-950 text-sm font-black text-white">
                      0{index + 1}
                    </div>
                    <p className="pt-2 text-sm leading-relaxed text-stone-700 dark:text-slate-200">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[10px] border border-orange-200 bg-orange-50 px-5 py-5 dark:border-orange-900/60 dark:bg-orange-950/30">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
                  Good To Know
                </p>
                <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-slate-200">
                  Volunteer roles are coordinated around festival needs,
                  availability, and fit. Sharing clear timing, support
                  preferences, and a short motivation note helps the team place
                  people thoughtfully.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
