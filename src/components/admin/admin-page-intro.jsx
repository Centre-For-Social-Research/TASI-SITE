'use client';

export default function AdminPageIntro({
  eyebrow,
  title,
  description,
  chips = [],
  actions = null,
}) {
  return (
    <section className="admin-page-intro rounded-[10px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92)_48%,rgba(224,231,255,0.72)_100%)] p-6 shadow-[0_24px_64px_rgba(79,70,229,0.10)] dark:border-white/[0.08] dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(17,24,39,0.92)_48%,rgba(30,41,59,0.68)_100%)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-purple-500 dark:text-purple-300">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
          {chips.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex cursor-default items-center rounded-[10px] border border-white/80 bg-white/85 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-zinc-300"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
