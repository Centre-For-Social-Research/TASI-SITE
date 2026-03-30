"use client";

import { Facebook, Twitter, Linkedin, Share2 } from "lucide-react";

export default function ShareButtons({ url, title }) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled or not supported
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="flex gap-4">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-white dark:hover:bg-stone-800 dark:hover:text-white"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X / Twitter"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:border-sky-500 hover:bg-sky-50 hover:text-sky-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-white dark:hover:bg-stone-800 dark:hover:text-white"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-white dark:hover:bg-stone-800 dark:hover:text-white"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={handleNativeShare}
        aria-label="Copy link / native share"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:border-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-white dark:hover:bg-stone-800 dark:hover:text-white"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
