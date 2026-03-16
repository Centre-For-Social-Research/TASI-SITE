import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { label: "About", href: "/about" },
  { label: "Past Editions", href: "/past-editions" },
  { label: "Themes", href: "/themes" },
  { label: "Speakers", href: "/speakers" },
  { label: "Sponsor", href: "/sponsor" },
  { label: "Contact", href: "/contact" },
];

export default function HomeNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-orange-200/70 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/img/tasi-csr-logo.png"
            alt="TASI 2026"
            width={176}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-stone-700 dark:text-zinc-200 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-orange-700 dark:hover:text-orange-400"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle className="ml-1" />
          <Link
            href="/register"
            className="rounded-md bg-orange-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-800"
          >
            Register Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
