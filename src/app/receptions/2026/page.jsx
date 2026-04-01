import ReceptionsPage from "@/components/receptions/receptions-page";

export const metadata = {
  title: "TASI 2026 Receptions",
  description:
    "Book your place in the TASI 2026 reception programme through standard, supporter, and community ticket access.",
  alternates: {
    canonical: "/receptions/2026",
  },
};

export default function Page() {
  return <ReceptionsPage initialMode="pre" />;
}
