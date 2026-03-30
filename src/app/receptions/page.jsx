import ReceptionsPage from '@/components/receptions/receptions-page';

export const metadata = {
  title: 'TASI Receptions',
  description:
    'Explore the three embassy-hosted receptions of TASI 2025, from the opening diplomatic welcome to the closing evening focused on the path to AI Summit 2026.',
  alternates: {
    canonical: '/receptions',
  },
};

export default function Page() {
  return <ReceptionsPage />;
}
