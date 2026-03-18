"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, PlayCircle, SparklesIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Badge } from "@/components/ui/badge";

export interface VideoCarouselItem {
  title: string;
  speaker: string;
  quote: string;
  edition: string;
  placeholderSrc?: string;
  iframeSrc?: string;
}

interface CardCarouselProps {
  videos: VideoCarouselItem[];
  autoplayDelay?: number;
  autoplay?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({
  videos,
  autoplayDelay = 2400,
  autoplay = false,
  showPagination = true,
  showNavigation = true,
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const getMuxThumbnail = (iframeSrc?: string) => {
    if (!iframeSrc) {
      return null;
    }

    const match = iframeSrc.match(/player\.mux\.com\/([^?\/]+)/i);
    if (!match?.[1]) {
      return null;
    }

    return `https://image.mux.com/${match[1]}/thumbnail.jpg?time=2`;
  };

  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 44px;
  }

  .swiper-slide {
    width: 320px;
  }

  .swiper-3d .swiper-slide-shadow-left,
  .swiper-3d .swiper-slide-shadow-right {
    background-image: none;
  }

  .tasi-video-pagination .swiper-pagination-bullet {
    background: #f97316;
    opacity: 0.4;
  }

  .tasi-video-pagination .swiper-pagination-bullet-active {
    opacity: 1;
  }
  `;

  return (
    <section className="w-full space-y-4">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-6xl rounded-[24px] border border-black/10 bg-white p-2 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900 md:rounded-[34px]">
        <div className="relative mx-auto flex w-full flex-col rounded-[20px] border border-black/10 bg-gradient-to-b from-orange-50 to-white p-2 dark:border-zinc-700/70 dark:from-zinc-900 dark:to-zinc-950 md:rounded-[28px] md:p-3">
          <Badge
            variant="outline"
            className="absolute left-4 top-6 rounded-[14px] border border-black/10 bg-white/80 text-sm dark:border-zinc-600 dark:bg-zinc-900/85 dark:text-zinc-100 md:left-6"
          >
            <SparklesIcon className="mr-1 h-3.5 w-3.5 fill-orange-200 stroke-1 text-neutral-800" />
            Video Testimonials
          </Badge>

          <div className="flex flex-col items-center justify-center px-4 pb-2 pt-14 text-center">
            <h3 className="text-2xl font-black tracking-tight text-stone-900 dark:text-zinc-100 md:text-4xl">
              Voices from TASI 2025
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-stone-600 dark:text-zinc-300 md:text-base">
              Explore real perspectives from global trust and safety leaders. Use the left and right controls to choose and play each testimonial.
            </p>
          </div>

          <div className="flex w-full items-center justify-center gap-4 px-1 pb-2 md:px-2">
            <div className="relative w-full tasi-video-pagination">
              {showNavigation ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous video"
                    className="tasi-carousel-prev absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-stone-300 bg-white/95 p-2 text-stone-700 shadow-md transition hover:bg-white hover:text-stone-900 dark:border-zinc-600 dark:bg-zinc-900/95 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next video"
                    className="tasi-carousel-next absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-stone-300 bg-white/95 p-2 text-stone-700 shadow-md transition hover:bg-white hover:text-stone-900 dark:border-zinc-600 dark:bg-zinc-900/95 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}

              <Swiper
                spaceBetween={26}
                autoplay={
                  autoplay
                    ? {
                        delay: autoplayDelay,
                        disableOnInteraction: false,
                      }
                    : false
                }
                effect="coverflow"
                grabCursor
                centeredSlides
                loop
                slidesPerView="auto"
                onSwiper={(swiper) => setActiveIndex(swiper.realIndex)}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 90,
                  modifier: 2.1,
                }}
                pagination={showPagination}
                navigation={
                  showNavigation
                    ? {
                        nextEl: ".tasi-carousel-next",
                        prevEl: ".tasi-carousel-prev",
                      }
                    : undefined
                }
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
              >
                {videos.map((video, index) => {
                  const isActive = index === activeIndex;
                  const muxThumbnail = getMuxThumbnail(video.iframeSrc);

                  return (
                  <SwiperSlide key={`${video.edition}-${video.title}-${video.speaker}`}>
                    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                      <div className="relative aspect-[16/9] w-full bg-black">
                        {video.iframeSrc && isActive ? (
                          <iframe
                            src={video.iframeSrc}
                            title={`${video.title} by ${video.speaker}`}
                            className="h-full w-full"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : muxThumbnail ? (
                          <>
                            <Image
                              src={muxThumbnail}
                              alt={`Video placeholder for ${video.title}`}
                              fill
                              className="object-cover opacity-85"
                              sizes="(max-width: 768px) 88vw, 320px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-700 via-orange-600 to-stone-900" />
                        )}

                        {!video.iframeSrc || !isActive ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-white/90 p-2 shadow-lg dark:bg-zinc-900/90">
                              <PlayCircle className="h-9 w-9 text-orange-700" />
                            </div>
                          </div>
                        ) : null}

                        <span className="absolute left-3 top-3 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                          {video.edition}
                        </span>
                      </div>

                      <div className="space-y-2 p-4">
                        <p className="line-clamp-3 text-sm italic leading-relaxed text-stone-700 dark:text-zinc-300">"{video.quote}"</p>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 dark:text-zinc-100">{video.speaker}</h4>
                          <p className="text-xs text-stone-500 dark:text-zinc-400">{video.title}</p>
                        </div>
                      </div>
                    </article>
                  </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
