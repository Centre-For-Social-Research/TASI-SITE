import HomeFooter from '@/components/home/footer';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import AttendeesDirectory from '@/components/attendees/attendees-directory';
import { publicAttendees } from '@/lib/public-attendees';

export const metadata = {
  title: 'Attendees | TASI 2026',
  description:
    'Browse the public TASI attendee directory with consolidated participant details drawn from the festival guest lists.',
};

export const revalidate = 3600;

export default function AttendeesPage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              Public Attendees
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Meet the TASI community
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Explore one public-facing attendee directory built from the
              combined master, conference, embassy, and online registration
              lists. Search by person, organisation, event, or role and open
              each card for richer details.
            </p>
          </div>
        </BrandedPageHero>
        <AttendeesDirectory attendees={publicAttendees} />
      </main>
      <HomeFooter />
    </>
  );
}
