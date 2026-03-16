import Link from "next/link";

export default function LegacyPageShell({ title, summary, legacyFile }) {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-5xl px-4 py-14 md:px-6 md:py-20">
      <p className="mb-3 inline-flex rounded-full border border-orange-300 bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-800">
        Migration In Progress
      </p>
      <h1 className="mb-4 text-4xl font-black tracking-tight text-stone-900 md:text-6xl">{title}</h1>
      <p className="mb-6 text-lg text-stone-700">{summary}</p>

      <div className="rounded-xl border border-stone-300 bg-white p-5">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-stone-500">Legacy Source</p>
        <p className="mb-4 text-stone-700">This page is being migrated from: {legacyFile}</p>
        <Link href="/" className="inline-flex rounded-md bg-stone-900 px-4 py-2 font-semibold text-white hover:bg-stone-700">
          Back to Home
        </Link>
      </div>
    </main>
  );
}