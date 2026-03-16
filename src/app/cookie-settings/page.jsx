"use client";

import { useEffect, useState } from "react";
import LegalLayout from "@/components/LegalLayout";
import { DocSection, DocTable, MetaBadge } from "@/components/LegalComponents";

const PREFS_KEY = "tasi_cookie_prefs";

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative flex h-6 w-11 flex-shrink-0 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-orange-300/50 dark:focus:ring-orange-700/40
        ${checked ? "border-orange-700 bg-orange-700 dark:border-orange-300 dark:bg-orange-300" : "border-stone-300 bg-stone-200 dark:border-zinc-700 dark:bg-zinc-800"}
        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all
          ${checked ? "left-[calc(100%-22px)]" : "left-0.5"}`}
      />
    </button>
  );
}

function CookieCard({ title, badge, badgeVariant = "optional", description, checked, onChange, disabled }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4 rounded-xl border border-stone-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 flex flex-wrap items-center gap-2 text-base font-bold text-stone-900 dark:text-slate-100">
          {title}
          <span
            className={`rounded px-2 py-0.5 text-[0.65rem] font-sans font-semibold uppercase tracking-wide
            ${badgeVariant === "required" ? "bg-orange-50 text-orange-700 dark:bg-zinc-800 dark:text-orange-300" : "bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-slate-300"}`}
          >
            {badge}
          </span>
        </h3>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export default function CookieSettingsPage() {
  const [prefs, setPrefs] = useState({
    functional: true,
    analytics: false,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) {
        setPrefs(JSON.parse(stored));
      }
    } catch {
      // Ignore parse/storage errors and keep defaults.
    }
  }, []);

  const update = (key) => (value) => setPrefs((previous) => ({ ...previous, [key]: value }));

  const save = (overridePrefs) => {
    const toSave = overridePrefs || prefs;
    localStorage.setItem(PREFS_KEY, JSON.stringify(toSave));
    if (!overridePrefs) {
      setPrefs(toSave);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const acceptAll = () => {
    const all = { functional: true, analytics: true, marketing: true };
    setPrefs(all);
    save(all);
  };

  const rejectAll = () => {
    const none = { functional: false, analytics: false, marketing: false };
    setPrefs(none);
    save(none);
  };

  return (
    <LegalLayout
      title="Cookie Settings"
      kicker="Control which optional cookies are active while you browse the TASI website."
      updated="March 2026"
      applies="This website and related user preferences"
    >
      <div className="mb-8 flex flex-wrap gap-2">
        <MetaBadge variant="teal">Last Updated: March 2026</MetaBadge>
        <MetaBadge>Applies to: TASI website visitors</MetaBadge>
      </div>

      <DocSection number="01" title="About Cookies">
        <p>
          Cookies are small text files stored on your device when you visit a website. The TASI 2026
          website uses cookies to ensure core functionality, understand how visitors use the site, and
          improve your experience.
        </p>
        <p>
          Some preferences on this site are stored using browser storage technologies (for example, theme and
          cookie preference settings). We refer to these collectively as cookies/preferences on this page.
        </p>
      </DocSection>

      <DocSection number="02" title="Manage Your Preferences">
        <CookieCard
          title="Essential Cookies"
          badge="Always On"
          badgeVariant="required"
          description="Required for the site to function. These enable navigation, form submission, and session management. They cannot be disabled."
          checked={true}
          onChange={() => {}}
          disabled={true}
        />
        <CookieCard
          title="Functional Cookies"
          badge="Optional"
          description="Remember user preferences such as theme mode and convenience settings to improve return visits."
          checked={prefs.functional}
          onChange={update("functional")}
        />
        <CookieCard
          title="Analytics Cookies"
          badge="Optional"
          description="Help us understand how visitors interact with the site using anonymised and aggregated usage data."
          checked={prefs.analytics}
          onChange={update("analytics")}
        />
        <CookieCard
          title="Marketing Cookies"
          badge="Optional"
          description="Used only if campaign integrations are enabled for outreach and event communications."
          checked={prefs.marketing}
          onChange={update("marketing")}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => save()}
            className="rounded-full bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-orange-800 hover:shadow-md"
          >
            Save Preferences
          </button>
          <button
            onClick={acceptAll}
            className="rounded-full border border-stone-300 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-stone-100 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-900"
          >
            Accept All
          </button>
          <button
            onClick={rejectAll}
            className="rounded-full border border-stone-300 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-stone-100 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-900"
          >
            Reject All Optional
          </button>
          {saved ? <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Preferences saved</span> : null}
        </div>
      </DocSection>

      <hr className="my-2 border-t border-stone-200 dark:border-zinc-800" />

      <DocSection number="03" title="Cookies We Use">
        <DocTable
          headers={["Name", "Category", "Purpose", "Duration"]}
          rows={[
            ["tasi_cookie_prefs", "Essential", "Stores your cookie consent preferences", "12 months"],
            ["theme", "Functional", "Remembers your light/dark theme preference", "Until changed"],
            ["session/security tokens", "Essential", "Protects form submissions and session integrity", "Session"],
            ["analytics identifiers", "Analytics", "Measures page usage in aggregated form", "Varies by provider"],
            ["campaign tags", "Marketing", "Supports campaign attribution where enabled", "Varies"],
          ]}
        />
      </DocSection>
    </LegalLayout>
  );
}
