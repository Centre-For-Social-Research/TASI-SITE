"use client";

import { TestimonialSection } from "@/components/ui/testimonials";
import testimonialVideos from "@/data/testimonial-videos";

// We map precisely to the format that the new UI component expects
const testimonialsData = testimonialVideos.map((video, index) => ({
  id: index + 1,
  quote: video.quote,
  name: video.speaker,
  role: video.title,
  iframeSrc: video.iframeSrc,
}));

export default function VideoTestimonialsSection() {
  return (
    <div id="video-testimonials">
      <TestimonialSection
        eyebrow="Testimonials"
        title="Video Testimonials"
        subtitle="Hear directly from trust and safety leaders across policy, platforms, civil society, and international partnerships."
        testimonials={testimonialsData}
      />
    </div>
  );
}
