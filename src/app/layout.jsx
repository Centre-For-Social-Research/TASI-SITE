import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import CookieConsentBanner from "@/components/ui/cookie-consent-banner";
import { Footer } from "@/components/ui/demo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "TASI 2026",
  description:
    "TASI is India's first national convening focused on trust and safety, led by civil society. Convened by the Centre for Social Research (CSR) and Trust and Safety Festival, TASI creates a collaborative space for dialogue across government, industry, academia, and civil society. The festival advances innovation while centering safety and wellbeing, especially for women, children, and marginalised communities.",
  metadataBase: new URL("https://jamsaq.in"),
  openGraph: {
    title: "TASI 2026",
    description:
      "TASI is India's first national convening focused on trust and safety, led by civil society. Convened by the Centre for Social Research (CSR) and Trust and Safety Festival, TASI creates a collaborative space for dialogue across government, industry, academia, and civil society. The festival advances innovation while centering safety and wellbeing, especially for women, children, and marginalised communities.",
    url: "https://jamsaq.in",
    siteName: "TASI 2026",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TASI 2026 - Trust and Safety India Festival",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TASI 2026",
    description:
      "TASI is India's first national convening focused on trust and safety, led by civil society. Convened by the Centre for Social Research (CSR) and Trust and Safety Festival, TASI creates a collaborative space for dialogue across government, industry, academia, and civil society. The festival advances innovation while centering safety and wellbeing, especially for women, children, and marginalised communities.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <CookieConsentBanner />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
