import { notFound } from 'next/navigation';
import PartnerDetailPage from '@/components/partners/partner-detail-page';
import {
  getPartnerBySlug,
  getPartnerMetadata,
  getPartnerStaticParams,
} from '@/data/partners-page';

export function generateStaticParams() {
  return getPartnerStaticParams();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return getPartnerMetadata(slug);
}

export default async function Page({ params }) {
  const { slug } = await params;
  const partner = getPartnerBySlug(slug);

  if (!partner) notFound();

  return <PartnerDetailPage partner={partner} />;
}
