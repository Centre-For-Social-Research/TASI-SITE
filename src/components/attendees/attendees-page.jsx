import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import AttendeesDirectory from '@/components/attendees/attendees-directory';
import { attendeesHero } from '@/data/attendees-page';
import { publicAttendees } from '@/lib/public-attendees';

export default function AttendeesPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {attendeesHero.eyebrow}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {attendeesHero.title}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              {attendeesHero.description}
            </p>
          </div>
        </BrandedPageHero>
        <AttendeesDirectory attendees={publicAttendees} />
      </main>
    </>
  );
}
