import React from "react";

import { CardCarousel } from "@/components/ui/card-carousel";

const CardCarouselDemo = () => {
  const videos = [
    {
      edition: "TASI 2025",
      speaker: "Policy Leader",
      title: "Plenary Reflections",
      quote: "This forum made global trust and safety priorities actionable for regional contexts.",
      placeholderSrc: "/img/home-gallery/highlight-1.webp",
    },
    {
      edition: "TASI 2025",
      speaker: "Platform Expert",
      title: "Safety By Design",
      quote: "Cross-sector collaboration here created practical pathways for implementation.",
      placeholderSrc: "/img/home-gallery/highlight-2.webp",
    },
    {
      edition: "TASI 2025",
      speaker: "Civil Society Advocate",
      title: "Community Voices",
      quote: "The festival centered lived experience and policy action in one room.",
      placeholderSrc: "/img/home-gallery/highlight-3.webp",
    },
  ];

  return (
    <div className="w-full">
      <CardCarousel
        videos={videos}
        autoplayDelay={2200}
        showPagination
        showNavigation
      />
    </div>
  );
};

export default CardCarouselDemo;
