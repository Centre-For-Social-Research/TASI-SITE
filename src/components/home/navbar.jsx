"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

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

        <nav className="hidden items-center gap-5 text-sm font-medium text-stone-700 dark:text-zinc-200 md:flex">
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
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-stone-700 dark:text-zinc-200"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <nav className="border-t border-orange-200/70 bg-white/95 dark:border-zinc-800 dark:bg-zinc-900/95 md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 font-medium text-stone-700 transition hover:text-orange-700 dark:text-zinc-200 dark:hover:text-orange-400"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-block w-full rounded-md bg-orange-700 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-800"
                onClick={() => setIsOpen(false)}
              >
                Register Now
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
