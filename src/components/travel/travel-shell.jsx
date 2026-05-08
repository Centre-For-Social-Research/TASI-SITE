import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { travelShellCopy } from '@/data/plan-your-travel-page';
import TravelTabNav from './travel-tab-nav';

export default function TravelShell({ children }) {
  return (
    <>
      <HomeNavbar forceSolid />
      <main className="bg-[#fdf6ef] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <BrandedPageHero className="min-h-[300px] py-14 md:min-h-[360px] md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {travelShellCopy.eyebrow}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {travelShellCopy.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-white/90">
              {travelShellCopy.description}
            </p>
          </div>
        </BrandedPageHero>
        <TravelTabNav />
        {children}
      </main>
    </>
  );
}
