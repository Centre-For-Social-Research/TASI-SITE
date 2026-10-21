'use client';

import { useEffect, useState } from 'react';

import {
  Gallery,
  ImageModal,
} from '@/components/ui/react-tailwind-image-gallery';
import { tasi2026Gallery } from '@/data/tasi-2026-edition';

// Twelve fills whole rows at 2, 3 and 4 columns, so the last row has no gap.
const VISIBLE_COUNT = 12;

const galleryData = tasi2026Gallery.map((photo, index) => ({
  id: index + 1,
  src: photo.src,
  alt: photo.alt,
  title: photo.caption,
  span: 'col-span-1',
}));

// A fixed spread across the whole set for the first paint (and for server
// rendering), so a visitor sees every event before pressing refresh.
function spreadSelection(items, count) {
  const step = items.length / count;
  const picked = new Set(
    Array.from({ length: count }, (_, i) => Math.floor(i * step))
  );
  return [
    ...items.filter((_, index) => picked.has(index)),
    ...items.filter((_, index) => !picked.has(index)),
  ];
}

function shuffleGallery(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export default function Tasi2026Gallery() {
  const [modalImage, setModalImage] = useState(null);
  const [items, setItems] = useState(() =>
    spreadSelection(galleryData, VISIBLE_COUNT)
  );
  const [isReanimating, setIsReanimating] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setModalImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleReanimate = () => {
    setIsReanimating(true);
    // Show twelve photos that are not on screen now, then queue the rest.
    setItems((current) => {
      const onScreen = current.slice(0, VISIBLE_COUNT);
      const hidden = current.slice(VISIBLE_COUNT);
      return [...shuffleGallery(hidden), ...onScreen];
    });

    window.setTimeout(() => {
      setIsReanimating(false);
    }, 420);
  };

  return (
    <>
      <Gallery
        data={items.slice(0, VISIBLE_COUNT)}
        onImageClick={setModalImage}
        eyebrow="In Pictures"
        title="Scenes from TASI 2026"
        subtitle="From the opening reception at the Goethe-Institut to the closing evening at the Netherlands Residence."
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
