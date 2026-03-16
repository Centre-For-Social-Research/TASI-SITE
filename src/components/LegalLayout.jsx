"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Cookie Settings", href: "/cookie-settings" },
];

export default function LegalLayout({ title, kicker, updated, applies, children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-orange-200/70 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/img/tasi-csr-logo.png"
              alt="TASI 2026"
              width={176}
              height={48}
              className="h-11 w-auto"
              priority
            />
          </Link>
          <Link href="/" className="text-sm font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">
            Back to Site
          </Link>
        </nav>
      </header>

      <div className="border-b border-orange-200/70 bg-gradient-to-b from-stone-100 to-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-[radial-gradient(circle_at_20%_0%,#1f2937_0%,#0b1220_45%,#05070e_100%)] md:py-14">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-slate-300">
          Legal &amp; Privacy
        </span>
        <h1 className="mb-3 text-4xl font-black tracking-tight text-stone-900 dark:text-slate-100 md:text-5xl">{title}</h1>
        <p className="mx-auto max-w-2xl text-sm text-stone-600 dark:text-slate-300">{kicker}</p>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mt-0 flex gap-1 border-b border-stone-200 dark:border-zinc-800">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative bottom-[-1px] rounded-t-md border border-b-0 px-4 py-3 text-sm font-medium no-underline transition-all
                ${pathname === link.href
                  ? "border-stone-200 bg-stone-50 text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-orange-300"
                  : "border-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-slate-400 dark:hover:bg-zinc-900 dark:hover:text-slate-100"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 px-4 pb-14 md:grid-cols-[220px_1fr] md:px-6">
        <aside className="sticky top-24 hidden pt-8 md:block">
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Details</p>
          {updated ? (
            <div className="mb-1.5 border-l-2 border-orange-300 pl-3 text-xs text-slate-700 dark:border-orange-700 dark:text-slate-300">
              <span className="font-medium text-orange-700 dark:text-orange-300">Updated:</span> {updated}
            </div>
          ) : null}
          {applies ? (
            <div className="border-l-2 border-stone-300 pl-3 text-xs text-slate-700 dark:border-zinc-700 dark:text-slate-300">
              <span className="font-medium">Applies to:</span> {applies}
            </div>
          ) : null}
        </aside>

        <main className="pt-8">{children}</main>
      </div>

    </div>
  );
}
