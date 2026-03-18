"use client";

import React from "react";
import { DM_Mono } from "next/font/google";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

type Clip = {
  id: string;
  title: string;
  src?: string;
  iframeSrc?: string;
  thumbnail: string;
};

const clips: Clip[] = [
  {
    id: "inaugural-reception",
    title: "TASI Innuagral Reception, French Embassy in India",
    iframeSrc:
      "https://player.mux.com/psR01owx9bZckkWPsAQhiy8vEdkEaxwKt0202Qx7YTPCWQ?metadata-video-title=TASI+Innuagral+Reception%2C+French+Embassy+in+India&video-title=TASI+Innuagral+Reception%2C+French+Embassy+in+India",
    thumbnail: "https://image.mux.com/psR01owx9bZckkWPsAQhiy8vEdkEaxwKt0202Qx7YTPCWQ/thumbnail.jpg?time=2",
  },
  {
    id: "netherland-reception",
    title: "TASI Reception at Netherland Embassy In India",
    iframeSrc:
      "https://player.mux.com/F6LuMTNPN3Ng2NDfLVZAJTEeQXSZ9utx01ukZfHE57TM?metadata-video-title=TASI+Reception+at+Netherland+Embassy+In+India&video-title=TASI+Reception+at+Netherland+Embassy+In+India",
    thumbnail: "https://image.mux.com/F6LuMTNPN3Ng2NDfLVZAJTEeQXSZ9utx01ukZfHE57TM/thumbnail.jpg?time=2",
  },
  {
    id: "french-reception-alt",
    title: "TASI Innaugral Reception in French Embassy in India",
    iframeSrc:
      "https://player.mux.com/sv9eWr01kOo402EYUxBxeL3rN2mTjVm8WxslLxdGDeoMg?metadata-video-title=TASI+Innaugral+Reception+in+French+Embassy+in+india&video-title=TASI+Innaugral+Reception+in+French+Embassy+in+india",
    thumbnail: "https://image.mux.com/sv9eWr01kOo402EYUxBxeL3rN2mTjVm8WxslLxdGDeoMg/thumbnail.jpg?time=2",
  },
  {
    id: "jaishankar-tasi-2025",
    title: "EAM Dr. S Jaishankar at TASI 2025",
    iframeSrc:
      "https://player.mux.com/7tfFGcpzX1E00rukwCY4IMhTn3b8921p8UaZOG1500YRo?metadata-video-title=EAM+Dr.+S+Jaishankar+at+TASI+2025&video-title=EAM+Dr.+S+Jaishankar+at+TASI+2025",
    thumbnail: "https://image.mux.com/7tfFGcpzX1E00rukwCY4IMhTn3b8921p8UaZOG1500YRo/thumbnail.jpg?time=2",
  },
];

export default function ImmersiveVideoShowcase() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isInView, setIsInView] = React.useState(false);

  const activeClip = clips[activeIndex];

  React.useEffect(() => {
    const target = sectionRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.35);
      },
      {
        threshold: [0.2, 0.35, 0.55],
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isInView) {
      void video
        .play()
        .catch(() => {
          // Autoplay can be blocked on some devices despite muted playback.
        });
      return;
    }

    video.pause();
  }, [isInView, activeIndex]);

  const getMutedEmbedSrc = (src: string) => {
    try {
      const url = new URL(src);
      url.searchParams.set("muted", "true");
      url.searchParams.set("autoplay", "true");
      url.searchParams.set("playsinline", "true");
      return url.toString();
    } catch {
      return src;
    }
  };

  const handleSelectClip = (index: number) => {
    if (index === activeIndex) {
      return;
    }

    setActiveIndex(index);

    requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.load();
      if (isInView) {
        void video
          .play()
          .catch(() => {
            // Ignore autoplay rejections and keep muted state.
          });
      }
    });
  };

  return (
    <section
      ref={sectionRef}
      className={`relative left-1/2 right-1/2 h-[80vh] min-h-[420px] w-screen -translate-x-1/2 overflow-hidden transition-all duration-700 ease-out ${
        isInView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {activeClip.iframeSrc ? (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            key={activeClip.id}
            src={getMutedEmbedSrc(activeClip.iframeSrc)}
            title={activeClip.title}
            className="absolute left-1/2 top-1/2 h-[126vh] w-[126vw] max-w-none -translate-x-1/2 -translate-y-1/2 md:h-[120vh] md:w-[120vw]"
            loading="lazy"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          key={activeClip.id}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          poster={activeClip.thumbnail}
          aria-label={activeClip.title}
        >
          <source src={activeClip.src} type="video/mp4" />
        </video>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45" />

      <div className="absolute bottom-4 left-4 z-20 md:bottom-5 md:left-6">
        <span
          className={`${dmMono.className} rounded-sm bg-black/30 px-2 py-1 text-[11px] tracking-[0.14em] text-[#ffd7c5] md:text-xs`}
        >
          TASI 2025 · New Delhi
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 md:hidden">
        <div className="overflow-x-auto px-2 pb-2">
          <div className="flex min-w-max gap-2">
            {clips.map((clip, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => handleSelectClip(index)}
                  aria-label={`Play ${clip.title}`}
                  className="relative h-20 w-28 flex-none overflow-hidden rounded-md"
                >
                  <img
                    src={clip.thumbnail}
                    alt={clip.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/35" />
                  <div
                    className={`absolute inset-0 border ${
                      isActive ? "border-[#ff6f61]" : "border-transparent"
                    }`}
                  />
                  <div className="absolute left-1.5 top-1.5 rounded-sm bg-[#556b2f]/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#ffe5d6]">
                    Clip {index + 1}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 hidden md:block">
        <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${clips.length}, minmax(0, 1fr))` }}>
          {clips.map((clip, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={clip.id}
                type="button"
                onClick={() => handleSelectClip(index)}
                aria-label={`Play ${clip.title}`}
                className="group relative h-32 w-full overflow-hidden lg:h-36"
              >
                    <img
                      src={clip.thumbnail}
                      alt={clip.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/20" />
                <div
                  className={`absolute inset-0 border ${
                    isActive ? "border-[#ff6f61]" : "border-transparent"
                  }`}
                />
                <div className="absolute left-2 top-2 rounded-sm bg-[#556b2f]/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ffe5d6]">
                  Clip {index + 1}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
