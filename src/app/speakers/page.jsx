import HomeNavbar from '@/components/home/navbar';
import SpeakersPageClient from '@/components/speakers/speakers-page-client';

export const revalidate = 3600;

export const metadata = {
  title: 'Trust and Safety India Festival Speakers | TASI Speakers',
  description:
    'Explore Trust and Safety India Festival speakers, including government, industry, civil society, safety, policy, platform, and AI governance leaders.',
  alternates: {
    canonical: '/speakers',
  },
};

export default async function SpeakersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialYear = resolvedSearchParams?.year === '2026' ? '2026' : '2025';

  return (
    <>
      <HomeNavbar />
      <SpeakersPageClient initialYear={initialYear} />
    </>
  );
}
