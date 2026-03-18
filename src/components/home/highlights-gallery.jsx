"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, RefreshCw, X } from "lucide-react";
import MasonryGallery from "@/components/ui/masonry-gallery";
import { MotionReveal } from "./motion-reveal";

const GALLERY_FILES = [
  "7T7A0181.webp",
  "7T7A0215.webp",
  "7T7A0259.webp",
  "7T7A0527.webp",
  "7T7A0573.webp",
  "7T7A0646.webp",
  "7T7A1512.webp",
  "7T7A2715.webp",
  "7T7A2996.webp",
  "7T7A3314 (1).webp",
  "7T7A3544.webp",
  "7T7A3637.webp",
  "7T7A4136.webp",
  "7T7A4166.webp",
  "7T7A4504.webp",
  "7T7A4633.webp",
  "7T7A4822 (1).webp",
  "7T7A4889.webp",
  "7T7A5090.webp",
  "7T7A5164.webp",
  "7T7A5237.webp",
  "7T7A5507.webp",
  "7T7A5530 (1).webp",
  "7T7A5564.webp",
  "7T7A5609.webp",
  "7T7A5647.webp",
  "7T7A5650.webp",
  "7T7A5664.webp",
  "7T7A9399.webp",
  "7T7A9793.webp",
  "7T7A9834.webp",
  "7T7A9837.webp",
  "7T7A9942.webp",
  "7T7A9973.webp",
  "7T7A9974.webp",
  "IMG_6646.webp",
  "IMG_7326.webp",
  "WhatsApp Image 2025-12-04 at 17.03.33_b1b66d02.webp",
  "WhatsApp Image 2025-12-04 at 17.03.34_6a5fea05.webp",
  "WhatsApp Image 2025-12-04 at 17.03.35_9dd57c30.webp",
  "WhatsApp Image 2025-12-04 at 17.03.38_3cb919f4.webp",
];

const LEGACY_CAPTIONS = {
  "7T7A0181.webp": "Registration & Delegate Passes",
  "7T7A0215.webp": "Networking & Connections",
  "7T7A0259.webp": "Outdoor Receptions",
  "7T7A0527.webp": "High-Level Panel Discussions",
  "7T7A0573.webp": "Inaugural Lamp Lighting",
  "7T7A0646.webp": "Ministerial Keynote Address",
  "7T7A1512.webp": "Interactive Policy Rounds",
  "7T7A2715.webp": "Plenary Sessions",
  "7T7A2996.webp": "Expert Insights",
  "7T7A3314 (1).webp": "Cross-Border Cooperation Panel",
  "7T7A3544.webp": "Safety by Design",
  "7T7A3637.webp": "Industry Partners & Exhibitors",
  "7T7A4136.webp": "Civil Society Perspectives",
  "7T7A4166.webp": "Fireside Chats",
  "7T7A4504.webp": "Regulatory Frameworks",
  "highlight-1.webp": "Festival delegates in discussion",
  "highlight-2.webp": "Stage conversation at TASI",
  "highlight-3.webp": "Audience participating in a session",
  "highlight-4.webp": "Networking and informal exchange",
  "highlight-5.webp": "Speakers on stage during event programming",
  "highlight-6.webp": "Workshop or roundtable setting",
};

const LEGACY_HEIGHTS = {
  "7T7A0181.webp": 400,
  "7T7A0215.webp": 260,
  "7T7A0259.webp": 520,
  "7T7A0527.webp": 360,
  "7T7A0573.webp": 500,
  "7T7A0646.webp": 320,
  "7T7A1512.webp": 450,
  "7T7A2715.webp": 300,
  "7T7A2996.webp": 540,
  "7T7A3314 (1).webp": 340,
  "7T7A3544.webp": 380,
  "7T7A3637.webp": 460,
  "7T7A4136.webp": 310,
  "7T7A4166.webp": 420,
  "7T7A4504.webp": 360,
};

const FALLBACK_HEIGHTS = [320, 360, 390, 420, 450, 380, 340, 410, 500, 300];

const slugToCaption = (fileName, index) => {
  if (LEGACY_CAPTIONS[fileName]) {
    return LEGACY_CAPTIONS[fileName];
  }

  if (fileName.startsWith("7T7A") || fileName.startsWith("IMG_") || fileName.startsWith("WhatsApp")) {
    return "Festival Highlight";
  }

  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const toPublicPath = (fileName) => `/img/home-gallery/${encodeURI(fileName)}`;

const INITIAL_ITEMS = GALLERY_FILES.map((fileName, index) => ({
  id: String(index + 1),
  img: toPublicPath(fileName),
  height: LEGACY_HEIGHTS[fileName] || FALLBACK_HEIGHTS[index % FALLBACK_HEIGHTS.length],
  title: slugToCaption(fileName, index),
}));

function shuffleItems(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function HighlightsGallery() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [galleryKey, setGalleryKey] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  const handleRefresh = () => {
    setItems(shuffleItems(INITIAL_ITEMS));
    setGalleryKey((current) => current + 1);
    setActiveIndex(null);
  };

  const handleOpenLightbox = (_item, index) => {
    setActiveIndex(index);
  };

  const handleCloseLightbox = () => {
    setActiveIndex(null);
  };

  const handleNext = () => {
    if (items.length === 0) {
      return;
    }

    setActiveIndex((current) => {
      if (current === null) {
        return 0;
      }

      return (current + 1) % items.length;
    });
  };

  const handlePrevious = () => {
    if (items.length === 0) {
      return;
    }

    setActiveIndex((current) => {
      if (current === null) {
        return 0;
      }

      return (current - 1 + items.length) % items.length;
    });
  };

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const dialogEl = dialogRef.current;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseLightbox();
      }

      if (event.key === "ArrowRight") {
        handleNext();
      }

      if (event.key === "ArrowLeft") {
        handlePrevious();
      }

      if (event.key === "Tab" && dialogEl) {
        const focusable = dialogEl.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusable.length) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (activeIndex !== null) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
      return () => {
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
      previousFocusRef.current.focus();
    }
  }, [activeIndex]);

  return (
    <section className="relative bg-[linear-gradient(180deg,#fffdf7_0%,#f3ede3_100%)] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <MotionReveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Moments</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Event Highlights</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-stone-600 md:text-lg">
            A glimpse into past gatherings, workshops and high-level dialogues driving the future of digital trust and safety.
          </p>
        </MotionReveal>

        <MotionReveal className="mt-6 flex justify-center" delay={0.08}>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-orange-400 hover:text-orange-700"
            title="Re-animate Gallery"
            aria-label="Re-animate Gallery"
          >
            <RefreshCw className="h-4 w-4" />
            Re-animate Gallery
          </button>
        </MotionReveal>

        <div className="mt-10 w-full">
          <MasonryGallery
            key={galleryKey}
            items={items}
            animateFrom="bottom"
            blurToFocus
            stagger={0.08}
            scaleOnHover
            hoverScale={0.96}
            colorShiftOnHover
            onItemClick={handleOpenLightbox}
          />
        </div>

        {activeItem ? (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="highlights-lightbox-title"
            onClick={handleCloseLightbox}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleCloseLightbox}
              className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Close image preview"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 md:left-8"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>

            <div
              ref={dialogRef}
              className="relative max-h-[88vh] max-w-[92vw] overflow-hidden rounded-2xl border border-white/20 bg-black/50 p-2 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative flex max-h-[82vh] max-w-[90vw] items-center justify-center bg-black/30">
                <Image
                  src={activeItem.img}
                  alt={activeItem.title || "Gallery image"}
                  width={1800}
                  height={1200}
                  quality={90}
                  className="h-auto max-h-[82vh] w-auto max-w-[90vw] object-contain"
                  sizes="(max-width: 768px) 90vw, (max-width: 1200px) 85vw, 80vw"
                />
              </div>
              <div id="highlights-lightbox-title" className="px-3 pb-2 pt-3 text-center text-sm font-medium text-white">
                {activeItem.title || "Festival Highlight"}
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 md:right-8"
              aria-label="Next image"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
