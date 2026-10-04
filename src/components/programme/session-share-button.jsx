'use client';

import { Check, Link2, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function buildShareTargets(url, text) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return [
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    },
    {
      label: 'X (Twitter)',
      href: `https://x.com/intent/post?url=${u}&text=${t}`,
    },
    { label: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    { label: 'Email', href: `mailto:?subject=${t}&body=${t}%0A%0A${u}` },
  ];
}

// Shares one programme session. Phones get the native share sheet; desktops
// get a small menu of social links plus copy-link.
export default function SessionShareButton({ path, title, className }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const getUrl = () => `${window.location.origin}${path}`;
  const shareText = `${title} · Trust and Safety India Festival`;

  const handleClick = async () => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch && navigator.share) {
      try {
        await navigator.share({ title: shareText, url: getUrl() });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    setOpen((value) => !value);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', getUrl());
    }
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleClick}
      >
        <Share2 aria-hidden="true" />
        <span>Share</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 w-52 rounded-[10px] border border-stone-200 bg-white p-1.5 text-sm text-stone-800 shadow-lg dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        >
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            ) : (
              <Link2 className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <div className="my-1 h-px bg-stone-200 dark:bg-stone-700" />
          {buildShareTargets(getUrl(), shareText).map((target) => (
            <a
              key={target.label}
              role="menuitem"
              href={target.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-stone-700 no-underline hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              {target.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
