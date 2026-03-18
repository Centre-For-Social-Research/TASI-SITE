"use client";

import { CardCarousel } from "@/components/ui/card-carousel";
import testimonialVideos from "@/data/testimonial-videos";

export default function VideoTestimonialsSection() {
  return (
    <section className="bg-white py-14 dark:bg-zinc-950 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-zinc-400">
          Testimonials
        </p>
        <h2 className="mb-4 text-3xl font-black tracking-tight text-stone-900 dark:text-zinc-100 md:text-5xl">
          Video Testimonials
        </h2>
        <p className="mb-8 max-w-3xl text-stone-700 dark:text-zinc-300">
          Hear directly from trust and safety leaders across policy, platforms, civil society, and international partnerships.
        </p>
        <CardCarousel videos={testimonialVideos} showPagination showNavigation />
      </div>
    </section>
  );
}
