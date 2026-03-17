import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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
  description: "Next.js migration workspace for TASI 2026",
  metadataBase: new URL("https://jamsaq.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TASI 2026",
    description:
      "Trust and Safety India Festival 2026: leaders from policy, industry, and civil society shaping safer digital spaces.",
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
      "Trust and Safety India Festival 2026: policy, AI, and digital safety dialogue in New Delhi.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
