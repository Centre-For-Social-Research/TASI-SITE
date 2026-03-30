import { ClerkProvider } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Not Authorized | TASI 2026",
};

export default function NotAuthorizedLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
