'use client';

import React from 'react';
import Image from 'next/image';

type Clip = {
  id: string;
  title: string;
  src?: string;
  iframeSrc?: string;
  thumbnail: string;
};

const clips: Clip[] = [
  {
    id: 'inaugural-reception',
    title: 'TASI Inaugural Reception, French Embassy in India',
    iframeSrc:
      'https://player.mux.com/psR01owx9bZckkWPsAQhiy8vEdkEaxwKt0202Qx7YTPCWQ?metadata-video-title=TASI+Innuagral+Reception%2C+French+Embassy+in+India&video-title=TASI+Innuagral+Reception%2C+French+Embassy+in+India',
    thumbnail:
      'https://image.mux.com/psR01owx9bZckkWPsAQhiy8vEdkEaxwKt0202Qx7YTPCWQ/thumbnail.jpg?time=2',
  },
  {
    id: 'netherland-reception',
    title: 'TASI Reception at Netherlands Embassy in India',
    iframeSrc:
      'https://player.mux.com/F6LuMTNPN3Ng2NDfLVZAJTEeQXSZ9utx01ukZfHE57TM?metadata-video-title=TASI+Reception+at+Netherland+Embassy+In+India&video-title=TASI+Reception+at+Netherland+Embassy+In+India',
    thumbnail:
      'https://image.mux.com/F6LuMTNPN3Ng2NDfLVZAJTEeQXSZ9utx01ukZfHE57TM/thumbnail.jpg?time=2',
  },
  {
    id: 'french-reception-alt',
    title: 'TASI Inaugural Reception in French Embassy in India',
    iframeSrc:
      'https://player.mux.com/sv9eWr01kOo402EYUxBxeL3rN2mTjVm8WxslLxdGDeoMg?metadata-video-title=TASI+Innaugral+Reception+in+French+Embassy+in+india&video-title=TASI+Innaugral+Reception+in+French+Embassy+in+india',
    thumbnail:
      'https://image.mux.com/sv9eWr01kOo402EYUxBxeL3rN2mTjVm8WxslLxdGDeoMg/thumbnail.jpg?time=2',
  },
  {
    id: 'jaishankar-tasi-2025',
    title: 'EAM Dr. S Jaishankar at TASI 2025',
    iframeSrc:
      'https://player.mux.com/7tfFGcpzX1E00rukwCY4IMhTn3b8921p8UaZOG1500YRo?metadata-video-title=EAM+Dr.+S+Jaishankar+at+TASI+2025&video-title=EAM+Dr.+S+Jaishankar+at+TASI+2025',
    thumbnail:
      'https://image.mux.com/7tfFGcpzX1E00rukwCY4IMhTn3b8921p8UaZOG1500YRo/thumbnail.jpg?time=2',
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
      void video.play().catch(() => {
        // Autoplay can be blocked on some devices despite muted playback.
      });
      return;
    }

    video.pause();
  }, [isInView, activeIndex]);

  const getMutedEmbedSrc = (src: string) => {
    try {
      const url = new URL(src);
      url.searchParams.set('muted', 'true');
      url.searchParams.set('autoplay', 'true');
      url.searchParams.set('playsinline', 'true');
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
        void video.play().catch(() => {
          // Ignore autoplay rejections and keep muted state.
        });
      }
    });
  };

  return (
    <section
      ref={sectionRef}
      className="bg-[linear-gradient(180deg,#f5f1ea_0%,#ffffff_100%)] py-section-sm md:py-section-lg"
    >
      <div
        className={`mx-auto w-full max-w-[1300px] px-4 transition-all duration-700 ease-out md:px-8 lg:px-16 ${
          isInView ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        <div className="mb-12 max-w-3xl md:mb-16">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-rc-accent dark:text-white md:text-sm">
            Highlights
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl lg:text-[3.2rem]">
            Immersive Video Showcase
          </h2>
          <p className="mt-5 text-body-lg text-stone-700">
            Revisit key moments from the inaugural festival, from diplomatic
            receptions to opening-day leadership moments.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-950 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
          <div className="relative aspect-video min-h-[260px] overflow-hidden md:min-h-[480px]">
            {activeClip.iframeSrc ? (
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  key={activeClip.id}
                  src={getMutedEmbedSrc(activeClip.iframeSrc)}
                  title={activeClip.title}
                  className="absolute inset-0 h-full w-full md:left-1/2 md:top-1/2 md:h-[120vh] md:w-[120vw] md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2"
                  loading="lazy"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
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

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />

            <div className="absolute bottom-4 left-4 z-20 md:bottom-6 md:left-6">
              <span className="rounded-full bg-black/35 px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-[#ffd7c5] backdrop-blur-sm md:text-xs">
                TASI 2025 | New Delhi
              </span>
            </div>

            <div className="absolute bottom-4 right-4 z-20 max-w-[calc(100%-2rem)] rounded-2xl bg-black/35 px-4 py-3 text-white backdrop-blur-sm md:bottom-6 md:right-6 md:max-w-md md:px-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rc-secondary dark:text-white">
                Now Playing
              </p>
              <p className="mt-2 text-base font-semibold leading-snug md:text-lg">
                {activeClip.title}
              </p>
            </div>
          </div>

          <div className="grid gap-0 md:hidden">
            <div className="overflow-x-auto px-3 py-3">
              <div className="flex min-w-max gap-3">
                {clips.map((clip, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={clip.id}
                      type="button"
                      onClick={() => handleSelectClip(index)}
                      aria-label={`Play ${clip.title}`}
                      className="relative h-24 w-32 flex-none overflow-hidden rounded-2xl"
                    >
                      <Image
                        src={clip.thumbnail}
                        alt={clip.title}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/35" />
                      <div
                        className={`absolute inset-0 border-2 ${isActive ? 'border-[#ff6f61]' : 'border-transparent'}`}
                      />
                      <div className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#ffe5d6]">
                        Clip {index + 1}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="hidden md:grid"
            style={{
              gridTemplateColumns: `repeat(${clips.length}, minmax(0, 1fr))`,
            }}
          >
            {clips.map((clip, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => handleSelectClip(index)}
                  aria-label={`Play ${clip.title}`}
                  className="group relative h-32 w-full overflow-hidden border-t border-white/10 lg:h-36"
                >
                  <Image
                    src={clip.thumbnail}
                    alt={clip.title}
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/20" />
                  <div
                    className={`absolute inset-0 border-2 ${isActive ? 'border-[#ff6f61]' : 'border-transparent'}`}
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ffe5d6]">
                    Clip {index + 1}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
