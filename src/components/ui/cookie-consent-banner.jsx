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
    <div className="fixed inset-x-0 bottom-4 z-[140] px-4">
      <div className="mx-auto w-full max-w-5xl rounded-[10px] border border-slate-900/10 bg-slate-950 px-5 py-4 text-white shadow-[0_24px_60px_rgba(15,23,42,0.35)] ring-1 ring-black/5 dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-5">
          <p className="text-sm leading-relaxed text-slate-100">
            We use essential cookies and optional cookies for analytics and personalization. Choose your preferences.
            <Link href="/cookie-settings" className="ml-1 font-semibold text-amber-300 underline underline-offset-2 transition hover:text-amber-200">
            Cookie Settings
            </Link>
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={rejectOptional}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              Reject Optional
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
