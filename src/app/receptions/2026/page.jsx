import ReceptionsPage from "@/components/receptions/receptions-page";

export const metadata = {
  title: "TASI 2026 Receptions",
  description:
    "Explore the TASI 2026 receptions programme and hospitality context around the wider festival.",
  alternates: {
    canonical: "/receptions/2026",
  },
};

export default function Page() {
  return <ReceptionsPage initialMode="pre" />;
}
