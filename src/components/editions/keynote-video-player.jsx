'use client';

import { useState } from 'react';
import { PlayCircle } from 'lucide-react';

function getMuxThumbnail(iframeSrc, thumbnailTime = 2) {
  const match = iframeSrc?.match(/player\.mux\.com\/([^?/]+)/i);
  return match?.[1]
    ? `https://image.mux.com/${match[1]}/thumbnail.jpg?time=${thumbnailTime}`
    : null;
}

export default function KeynoteVideoPlayer({ iframeSrc, title, speaker, role, description, thumbnailTime }) {
  const [playing, setPlaying] = useState(false);
  const thumbnail = getMuxThumbnail(iframeSrc, thumbnailTime);

  return (
    <div className="overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      {/* Video area */}
      <div className="relative aspect-video w-full bg-black">
        {playing ? (
          <iframe
            src={iframeSrc}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            autoFocus
          />
        ) : (
          <>
            {thumbnail && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnail}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
              </>
            )}
            <button
              onClick={() => setPlaying(true)}
              aria-label={`Play ${title}`}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="rounded-full bg-white/90 p-2 shadow-lg transition hover:scale-105 dark:bg-zinc-900/90">
                <PlayCircle className="h-12 w-12 text-orange-600" />
              </div>
            </button>
          </>
        )}
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
