"use client";

import { useEffect, useState } from "react";
import { Gallery, ImageModal } from "@/components/ui/react-tailwind-image-gallery";

const LOCAL_GALLERY_FILES = [
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
];

const spanPattern = [
  "col-span-1",
  "sm:col-span-2",
  "col-span-1",
  "col-span-1",
  "sm:col-span-2",
  "col-span-1",
  "col-span-1",
  "col-span-1",
];

const galleryData = [
  ...LOCAL_GALLERY_FILES.map((fileName, index) => ({
    id: index + 1,
    src: `/img/home-gallery/${encodeURI(fileName)}`,
    alt: `TASI highlight ${index + 1}`,
    title: "Festival Highlight",
    span: "col-span-1",
  })),
];

function shuffleGallery(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export default function HighlightsGallery() {
  const [modalImage, setModalImage] = useState(null);
  const [items, setItems] = useState(galleryData);
  const [isReanimating, setIsReanimating] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setModalImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleReanimate = () => {
    setIsReanimating(true);
    setItems((current) => shuffleGallery(current));

    window.setTimeout(() => {
      setIsReanimating(false);
    }, 420);
  };

  return (
    <>
      <Gallery
        data={items}
        onImageClick={setModalImage}
        eyebrow="Moments"
        title="Event Highlights"
        subtitle="A glimpse into past gatherings, workshops and high-level dialogues driving the future of digital trust and safety."
        sectionClassName="py-section-sm md:py-section-md bg-white dark:bg-[#121212]"
        containerClassName="mx-auto w-full max-w-7xl px-4 md:px-8"
        onReanimate={handleReanimate}
        reanimateLabel="Refresh Gallery"
        isReanimating={isReanimating}
      />
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
    </>
  );
}
