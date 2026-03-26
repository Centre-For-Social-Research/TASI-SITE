"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

const PREFS_KEY = "tasi_cookie_prefs";

const ACCEPT_ALL = {
  functional: true,
  analytics: true,
  marketing: true,
};

const REJECT_OPTIONAL = {
  functional: false,
  analytics: false,
  marketing: false,
};

function persistCookiePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  localStorage.setItem("tasi_cookie_consent_at", new Date().toISOString());
  window.dispatchEvent(new CustomEvent("tasi-cookie-consent-updated", { detail: prefs }));
}

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const hasStoredPrefs = useMemo(() => {
    if (!mounted || pathname === "/cookie-settings" || typeof window === "undefined") {
      return false;
    }

    try {
      return Boolean(localStorage.getItem(PREFS_KEY));
    } catch {
      return false;
    }
  }, [mounted, pathname]);

  const visible = mounted && pathname !== "/cookie-settings" && !dismissed && !hasStoredPrefs;

  const acceptAll = () => {
    persistCookiePrefs(ACCEPT_ALL);
    setDismissed(true);
  };

  const rejectOptional = () => {
    persistCookiePrefs(REJECT_OPTIONAL);
    setDismissed(true);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] border-t border-stone-300 bg-white/98 p-4 shadow-[0_-12px_30px_rgba(0,0,0,0.12)] backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/98">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-5">
        <p className="text-sm leading-relaxed text-stone-700 dark:text-slate-200">
          We use essential cookies and optional cookies for analytics and personalization. Choose your preferences.
          <Link href="/cookie-settings" className="ml-1 font-semibold text-orange-700 underline underline-offset-2 dark:text-orange-300">
            Cookie Settings
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={rejectOptional}
            className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-zinc-600 dark:text-slate-200 dark:hover:bg-zinc-900"
          >
            Reject Optional
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-full bg-orange-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-800"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
