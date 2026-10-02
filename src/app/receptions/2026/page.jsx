import ReceptionsPage from '@/components/receptions/receptions-page';

export const metadata = {
  title: 'TASI 2026 Receptions',
  description:
    'TASI 2026 receptions: an opening reception hosted by the Embassies of France and Germany on 13 October, a private Match Group Policy Lab on 14 October, and a closing reception at the Embassy of the Netherlands on 15 October.',
  alternates: {
    canonical: '/receptions/2026',
  },
};

export default function Page() {
  return <ReceptionsPage initialMode="pre" />;
}
