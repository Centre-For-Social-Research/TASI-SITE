"use client";

import React from "react";

export interface GalleryItem {
  id: number | string;
  src: string;
  alt: string;
  title: string;
  span?: string;
}

interface GalleryProps {
  data: GalleryItem[];
  onImageClick: (src: string) => void;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  sectionClassName?: string;
  containerClassName?: string;
  onReanimate?: () => void;
  reanimateLabel?: string;
  isReanimating?: boolean;
}

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
}

export function Gallery({
  data,
  onImageClick,
  eyebrow,
  title = "Event Highlights",
  subtitle,
  sectionClassName = "py-10",
  containerClassName = "mx-auto w-full max-w-7xl px-4 md:px-8",
  onReanimate,
  reanimateLabel = "Re-animate Gallery",
  isReanimating = false,
}: GalleryProps) {
  return (
    <section id="portfolio" className={sectionClassName}>
      <div className={containerClassName}>
        {eyebrow ? (
          <p className="mb-3 text-center uppercase tracking-widest text-stone-500 dark:text-stone-400 text-body-xs font-semibold">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-center text-stone-900 dark:text-white text-display-lg font-black">
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-5 mb-10 max-w-4xl text-center text-stone-700 dark:text-stone-300 text-body-md font-normal leading-relaxed">
            {subtitle}
          </p>
        ) : (
          <div className="mb-12" />
        )}
        {onReanimate ? (
          <div className="mb-8 flex justify-center">
            <button
              type="button"
              onClick={onReanimate}
              className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] px-8 py-2.5 text-[16px] font-bold leading-6 text-white transition-transform hover:scale-[1.02] hover:opacity-90"
            >
              {reanimateLabel}
            </button>
          </div>
        ) : null}
        <div className="grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.map((img) => (
            <div
              key={img.id}
              className={`group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-500 ${isReanimating ? "scale-[0.98] opacity-70 saturate-125" : "scale-100 opacity-100 hover:-translate-y-1 hover:shadow-xl"} ${img.span || "col-span-1"}`}
              onClick={() => onImageClick(img.src)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="gallery-img h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                  {img.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ImageModal({ src, onClose }: ImageModalProps) {
  if (!src) return null;

  return (
    <div
      id="imageModal"
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 opacity-100"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Enlarged view"
        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />
      <button
        className="absolute top-5 right-5 text-white text-4xl font-bold"
        onClick={onClose}
        aria-label="Close image modal"
      >
        &times;
      </button>
    </div>
  );
}
