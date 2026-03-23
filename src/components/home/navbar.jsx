"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { label: "About Us", href: "/about" },
  { label: "Program", href: "/programme" },
  { label: "Speakers", href: "/speakers" },
  {
    label: "TASI Editions",
    href: "/tasi-2025",
    children: [
      { label: "TASI 2025", href: "/tasi-2025" },
      { label: "TASI 2026", href: "/tasi-2026" },
    ],
  },
  { label: "Sponsors", href: "/sponsor" },
  {
    label: "More",
    href: "/media",
    children: [
      { label: "Media", href: "/media" },
      { label: "Apply as a Volunteer", href: "/volunteer-application" },
      { label: "Apply to Speak", href: "/speaker-application" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export default function HomeNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 20;
        setScrolled((current) => (current === nextScrolled ? current : nextScrolled));
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 text-black shadow-md backdrop-blur dark:bg-gray-950/95 dark:text-white"
          : "bg-transparent text-white"
      }`}
    >
      <nav className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 md:px-8 md:py-3.5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-12">
        <Link href="/" className="flex items-center lg:justify-self-start">
          <Image
            src="/img/tasi-csr-logo.png"
            alt="TASI Logo"
            width={160}
            height={60}
            className="h-9 w-auto object-contain md:h-11"
            priority
          />
        </Link>

        <div className="hidden items-center justify-center gap-8 text-base font-bold lg:flex lg:justify-self-center">
          {navItems.map((item) => (
            item.children ? (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-2 transition-opacity hover:opacity-75 dark:text-white"
                >
                  {item.label}
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                  </svg>
                </Link>
                <div className="invisible absolute left-1/2 top-full z-50 mt-4 w-56 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="rounded-[10px] border border-stone-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950">
                      <div className="mb-2 px-3 pt-1 text-[10px] font-black uppercase tracking-[0.22em] text-stone-500 dark:text-slate-400">
                      {item.label === "More" ? "Explore" : "Editions"}
                      </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="group/item flex items-center justify-between rounded-full px-4 py-3 text-sm font-bold text-stone-800 transition-all duration-200 hover:bg-white hover:shadow-sm dark:text-slate-100 dark:hover:bg-white/10"
                      >
                        <span>{child.label}</span>
                        <span className="text-xs text-stone-400 transition-transform duration-200 group-hover/item:translate-x-0.5 dark:text-slate-500">
                          &gt;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="transition-opacity hover:opacity-75 dark:text-white"
              >
                {item.label}
              </Link>
            )
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex lg:justify-self-end">
          <ThemeToggle />
          <Link
            href="/register"
            className="rounded-full bg-rc-primary px-7 py-3 text-sm font-black uppercase tracking-widest text-rc-primary-foreground transition-transform hover:scale-105 hover:opacity-90"
          >
            REGISTER NOW
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle className="scale-90" />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-md p-2 dark:text-white"
            aria-label="Toggle menu"
          >
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="border-t border-white/15 bg-black/90 px-6 py-6 text-white shadow-xl backdrop-blur lg:hidden">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
            <div className="flex items-center justify-end">
              <ThemeToggle />
            </div>
            {navItems.map((item) => (
              item.children ? (
                <div key={item.label} className="space-y-3">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left text-lg font-bold tracking-wide transition-opacity hover:opacity-80"
                    onClick={() => setOpenMobileMenu((current) => (current === item.label ? null : item.label))}
                  >
                    <span>{item.label}</span>
                    <svg
                      className={`h-5 w-5 transition-transform ${openMobileMenu === item.label ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {openMobileMenu === item.label && (
                    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="rounded-xl px-3 py-2 text-base font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                          onClick={() => {
                            setIsOpen(false);
                            setOpenMobileMenu(null);
                          }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-bold tracking-wide transition-opacity hover:opacity-80"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )
            ))}
            <Link
              href="/register"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-rc-primary px-6 py-3 text-center text-sm font-black uppercase tracking-widest text-rc-primary-foreground transition-opacity hover:opacity-90"
              onClick={() => {
                setIsOpen(false);
                setOpenMobileMenu(null);
              }}
            >
              REGISTER NOW
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
