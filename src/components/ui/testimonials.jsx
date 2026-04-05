'use client';

import { useRef } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * A responsive section component to display customer testimonials.
 * It features a title, subtitle, and a carousel-style row of animated testimonial cards.
 */
export const TestimonialSection = ({
  eyebrow,
  title,
  subtitle,
  testimonials,
}) => {
  const carouselRef = useRef(null);

  const scrollByCards = (direction = 1) => {
    if (!carouselRef.current) {
      return;
    }

    const track = carouselRef.current;
    const card = track.querySelector('[data-testimonial-card]');
    const step = card ? card.clientWidth + 24 : track.clientWidth * 0.8;

    track.scrollBy({
      left: direction * step,
      behavior: 'auto',
    });
  };

  const handleNext = () => {
    scrollByCards(1);
  };

  const handlePrev = () => {
    scrollByCards(-1);
  };

  return (
    <section className="w-full bg-gradient-to-br from-[#5c0f4f] via-[#360454] to-[#15002b] py-section-md sm:py-section-lg">
      <div className="mx-auto w-full max-w-[1300px] px-6 lg:px-16">
        {/* Section Header */}
        <div className="text-center">
          {eyebrow ? (
            <p className="mb-3 text-center uppercase tracking-widest text-white/70 text-body-xs font-semibold">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-center text-white text-display-lg font-black">
            {title}
          </h2>
          <p className="mx-auto mt-5 mb-10 max-w-4xl text-center text-white/85 text-body-md font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="mt-16 flex flex-col gap-4 lg:gap-6">
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto px-1 pb-2 touch-pan-y overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                data-testimonial-card
                className="min-w-0 shrink-0 basis-full md:basis-[calc((100%-3rem)/3)]"
              >
                <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-rc-primary/12 bg-white shadow-[0_10px_30px_-18px_rgba(53,2,101,0.45)] transition-colors dark:border-white/15 dark:bg-zinc-900 dark:shadow-[0_12px_34px_-18px_rgba(0,0,0,0.8)]">
                  <div className="relative w-full pb-[56.25%] bg-black">
                    <iframe
                      src={testimonial.iframeSrc}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="absolute top-0 left-0 h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between bg-gradient-to-b from-white to-rc-primary/5 p-6 text-left text-rc-foreground dark:from-zinc-900 dark:to-zinc-800 dark:text-zinc-100">
                    <div>
                      <Quote
                        className="mb-4 h-8 w-8 text-rc-accent/70 dark:text-white"
                        aria-hidden="true"
                      />
                      <blockquote className="mb-6 text-sm font-medium leading-relaxed md:text-base">
                        &quot;{testimonial.quote}&quot;
                      </blockquote>
                    </div>
                    <figcaption className="mt-auto">
                      <p className="text-sm font-bold text-rc-primary md:text-base dark:text-white">
                        &mdash; {testimonial.name}
                        <span className="mt-1 block text-xs font-normal text-rc-primary/70 dark:text-zinc-300">
                          {testimonial.role}
                        </span>
                      </p>
                    </figcaption>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 lg:justify-end">
            <button
              onClick={handlePrev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-rc-primary/20 bg-rc-secondary text-rc-primary shadow-lg transition hover:opacity-90 dark:border-white/40 dark:bg-black/35 dark:text-white"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-rc-primary/20 bg-rc-secondary text-rc-primary shadow-lg transition hover:opacity-90 dark:border-white/40 dark:bg-black/35 dark:text-white"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
