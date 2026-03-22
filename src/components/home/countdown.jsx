"use client";

import { useEffect, useMemo, useState } from "react";

const INITIAL_TIME = {
  days: "00",
  hours: "00",
  minutes: "00",
  seconds: "00",
};

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
  const [time, setTime] = useState(INITIAL_TIME);

  useEffect(() => {
    setTime(formatRemaining(target));

    const id = window.setInterval(() => {
      setTime(formatRemaining(target));
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [target]);

  return (
    <div className="w-full max-w-xl rounded-xl border-4 border-[#350265] bg-[#ffd919] p-6 shadow-[8px_8px_0px_#350265] md:p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <p className="mb-6 text-sm font-bold uppercase tracking-widest text-[#ff6900]">
        COUNTDOWN TO{" "}
        <span
          className="text-[15px] font-normal leading-[21px] text-white"
          style={{ fontFamily: "Inter, Helvetica, Arial, sans-serif", fontStyle: "normal", fontWeight: 400 }}
        >
          TASI 2026
        </span>
      </p>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="flex flex-col items-center">
          <p className="text-4xl font-black text-[#350265] md:text-5xl">{time.days}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#350265]/80">Days</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-4xl font-black text-[#350265] md:text-5xl">{time.hours}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#350265]/80">Hours</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-4xl font-black text-[#350265] md:text-5xl">{time.minutes}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#350265]/80">Mins</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-4xl font-black text-[#ff6900] md:text-5xl">{time.seconds}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#ff6900]/80">Secs</p>
        </div>
      </div>
    </div>
  );
}
