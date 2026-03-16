"use client";

import { useEffect, useMemo, useState } from "react";

function formatRemaining(targetTime) {
  const now = Date.now();
  const delta = Math.max(0, targetTime - now);

  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((delta % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export default function Countdown() {
  const target = useMemo(() => new Date("2026-10-13T09:00:00+05:30").getTime(), []);
  const [time, setTime] = useState(() => formatRemaining(target));

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime(formatRemaining(target));
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [target]);

  return (
    <div className="w-full max-w-xl rounded-2xl border border-orange-200 bg-white/80 p-5 shadow-sm backdrop-blur md:p-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
        Countdown to TASI 2026
      </p>
      <div className="grid grid-cols-4 gap-2 text-center md:gap-4">
        <div>
          <p className="text-3xl font-black text-stone-900">{time.days}</p>
          <p className="text-xs uppercase tracking-wide text-stone-500">Days</p>
        </div>
        <div>
          <p className="text-3xl font-black text-stone-900">{time.hours}</p>
          <p className="text-xs uppercase tracking-wide text-stone-500">Hours</p>
        </div>
        <div>
          <p className="text-3xl font-black text-stone-900">{time.minutes}</p>
          <p className="text-xs uppercase tracking-wide text-stone-500">Mins</p>
        </div>
        <div>
          <p className="text-3xl font-black text-stone-900">{time.seconds}</p>
          <p className="text-xs uppercase tracking-wide text-stone-500">Secs</p>
        </div>
      </div>
    </div>
  );
}
