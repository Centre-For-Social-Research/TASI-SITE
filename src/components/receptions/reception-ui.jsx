'use client';

import Image from 'next/image';
import { MoveRight } from 'lucide-react';

export function ReceptionModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
      {['post', 'pre'].map((value) => {
        const active = mode === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${
              active
                ? 'bg-[#fff] text-[#140f26]'
                : 'text-white/80 hover:text-white'
            }`}
          >
            {value === 'post' ? '2025' : '2026'}
          </button>
        );
      })}
    </div>
  );
}

export function ReceptionSpeakerBadge({ person }) {
  return (
    <article className="rounded-[10px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 flex-none overflow-hidden rounded-full border border-white/10 bg-white/10">
          {person.photo ? (
            <Image
              src={person.photo}
              alt={person.name}
              fill
              className="scale-[1.14] object-cover object-center"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
              TASI
            </div>
          )}
        </div>
        <div className="min-h-[4.75rem] min-w-0">
          <h3 className="truncate text-base font-bold text-white">
            {person.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/70">
            {person.role}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ReceptionOverviewCard({ reception }) {
  return (
    <article className="flex h-full flex-col rounded-[10px] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/40 transition-transform duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-amber-300">
            {reception.shortDate}
          </p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            {reception.title}
          </h3>
        </div>
        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-[#fff] dark:border-slate-700">
          <Image
            src={reception.hostLogo}
            alt={reception.hostEmbassy}
            fill
            className="scale-[1.2] object-contain object-center p-1.5"
            sizes="48px"
          />
        </div>
      </div>
      <p className="mt-5 text-base font-semibold leading-relaxed text-stone-800 dark:text-slate-100">
        {reception.theme}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
        {reception.venue}
      </p>
      <p className="mt-5 flex-1 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
        {reception.summary}
      </p>
      {reception.agendaDownload ? (
        <a
          href={reception.agendaDownload}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-stone-700 transition hover:text-rc-primary dark:text-slate-200 dark:hover:text-amber-300"
        >
          Download agenda
        </a>
      ) : null}
      <a
        href={`#${reception.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-rc-primary dark:text-amber-300"
      >
        Explore reception
        <MoveRight className="h-4 w-4" />
      </a>
    </article>
  );
}
