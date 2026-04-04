'use client';

export default function KeynoteVideoPlayer({ iframeSrc, title, speaker, role, description }) {

  return (
    <div className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      {/* Video area */}
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={iframeSrc}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
          {role}
        </p>
        <h3 className="mt-1 text-lg font-bold tracking-tight text-stone-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
          <strong className="text-stone-800 dark:text-zinc-100">{speaker}</strong>
          {description ? `: ${description}` : ''}
        </p>
      </div>
    </div>
  );
}
