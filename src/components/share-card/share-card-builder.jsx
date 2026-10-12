'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Montserrat } from 'next/font/google';
import {
  Check,
  Copy,
  Download,
  ImagePlus,
  Linkedin,
  Share2,
  X,
} from 'lucide-react';

import shareCardUtils from '@/lib/share-card-utils.cjs';

const {
  CARD_CAPTION,
  cardFileName,
  fitFontSize,
  initialsFor,
  truncateToWidth,
  wrapLines,
} = shareCardUtils;

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '800'],
  display: 'swap',
});

// The template is a TASI 2026 speaker badge with the photo, name and
// "Speaking at" lines cleared, so attendee cards match the speaker badges.
const TEMPLATE_SRC = '/img/share-card/tasi-2026-card-template.webp';
const WIDTH = 1080;
const HEIGHT = 1350;
const NAVY = '#00327d';
const GREY = '#383737';
const CARD_BG = '#f6f1eb';
const PHOTO = { x: 540, y: 580, r: 195 };
const MAX_TEXT_WIDTH = 700;

// Phones that can share files open the native share sheet (LinkedIn,
// Instagram, WhatsApp) with the card attached. Decided on the client only.
const subscribe = () => () => {};
const getServerCanShareFiles = () => false;
let canShareFilesCache;
const getCanShareFiles = () => {
  if (canShareFilesCache === undefined) {
    canShareFilesCache =
      typeof navigator.canShare === 'function' &&
      navigator.canShare({
        files: [new File([''], 'card.png', { type: 'image/png' })],
      });
  }
  return canShareFilesCache;
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawPhoto(ctx, photo, name) {
  const { x, y, r } = PHOTO;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = CARD_BG;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    // Cover the circle, keeping the top of the photo where faces usually are.
    const scale = Math.max((r * 2) / photo.width, (r * 2) / photo.height);
    const w = photo.width * scale;
    const h = photo.height * scale;
    const top = h > r * 2 ? y - r - (h - r * 2) * 0.2 : y - h / 2;
    ctx.drawImage(photo, x - w / 2, top, w, h);
  } else {
    ctx.fillStyle = NAVY;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 130px ${montserrat.style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initialsFor(name) || 'TASI', x, y + 6);
  }
  ctx.restore();
}

function drawCard(ctx, template, photo, { name, designation, organisation }) {
  const family = montserrat.style.fontFamily;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(template, 0, 0, WIDTH, HEIGHT);
  drawPhoto(ctx, photo, name);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const displayName = (name.trim() || 'Your Name').toUpperCase();
  const nameSize = fitFontSize(
    (size) => {
      ctx.font = `800 ${size}px ${family}`;
      return ctx.measureText(displayName).width;
    },
    { max: 56, min: 34, maxWidth: MAX_TEXT_WIDTH }
  );
  ctx.font = `800 ${nameSize}px ${family}`;
  ctx.fillStyle = NAVY;
  ctx.fillText(displayName, WIDTH / 2, 838);

  // Designation and organisation get a line each, like the speaker badges.
  // A line that is too long shrinks a little, then ends with an ellipsis.
  // On its own, either one may wrap onto both lines.
  ctx.fillStyle = GREY;
  const parts = [designation, organisation]
    .map((text) => text.trim())
    .filter(Boolean);
  const measureAt = (size) => (text) => {
    ctx.font = `400 ${size}px ${family}`;
    return ctx.measureText(text).width;
  };
  let lines = [];
  if (parts.length === 1) {
    ctx.font = `400 31px ${family}`;
    const wrapped = wrapLines(parts[0], measureAt(31), MAX_TEXT_WIDTH);
    lines = wrapped.slice(0, 2).map((line, index) => ({
      text:
        index === 1 && wrapped.length > 2
          ? truncateToWidth(
              wrapped.slice(1).join(' '),
              measureAt(31),
              MAX_TEXT_WIDTH
            )
          : line,
      size: 31,
    }));
  } else {
    lines = parts.map((text) => {
      const size = fitFontSize((s) => measureAt(s)(text), {
        max: 31,
        min: 24,
        maxWidth: MAX_TEXT_WIDTH,
      });
      return {
        text: truncateToWidth(text, measureAt(size), MAX_TEXT_WIDTH),
        size,
      };
    });
  }
  lines.forEach(({ text, size }, index) => {
    ctx.font = `400 ${size}px ${family}`;
    ctx.fillText(text, WIDTH / 2, 878 + index * 36);
  });

  ctx.font = `500 31px ${family}`;
  ctx.fillStyle = '#022d5d';
  ctx.fillText("I'M ATTENDING #TASI2026", WIDTH / 2, 985);
}

export default function ShareCardBuilder() {
  const canvasRef = useRef(null);
  const templateRef = useRef(null);
  const photoUrlRef = useRef(null);
  const [details, setDetails] = useState({
    name: '',
    designation: '',
    organisation: '',
  });
  const [photo, setPhoto] = useState(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const canShareFiles = useSyncExternalStore(
    subscribe,
    getCanShareFiles,
    getServerCanShareFiles
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadImage(TEMPLATE_SRC),
      document.fonts.load(`800 56px ${montserrat.style.fontFamily}`),
      document.fonts.load(`400 31px ${montserrat.style.fontFamily}`),
      document.fonts.load(`500 31px ${montserrat.style.fontFamily}`),
    ]).then(([template]) => {
      if (cancelled) return;
      templateRef.current = template;
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    drawCard(
      canvasRef.current.getContext('2d'),
      templateRef.current,
      photo,
      details
    );
  }, [ready, photo, details]);

  const update = (field) => (event) =>
    setDetails((current) => ({ ...current, [field]: event.target.value }));

  const choosePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    // Read locally: the photo never leaves the device.
    photoUrlRef.current = URL.createObjectURL(file);
    try {
      setPhoto(await loadImage(photoUrlRef.current));
    } catch {
      setPhoto(null);
    }
  };

  const removePhoto = () => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = null;
    setPhoto(null);
  };

  const toBlob = useCallback(
    () =>
      new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png')),
    []
  );

  const download = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cardFileName(details.name);
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const share = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], cardFileName(details.name), {
      type: 'image/png',
    });
    try {
      await navigator.share({ files: [file], text: CARD_CAPTION });
    } catch {
      // The person closed the share sheet.
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(CARD_CAPTION);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(CARD_CAPTION)}`;
  const hasName = details.name.trim().length > 0;
  const field =
    'mt-1.5 w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-base text-stone-900 outline-none focus:border-[#ffd919] focus:ring-2 focus:ring-[#ffd919]/40';
  const button =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-left text-white backdrop-blur md:p-8">
        <label className="block text-sm font-semibold">
          Your name
          <input
            className={field}
            value={details.name}
            onChange={update('name')}
            maxLength={40}
            placeholder="As you'd like it on the card"
            autoComplete="name"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Designation{' '}
          <span className="font-normal text-white/60">(optional)</span>
          <input
            className={field}
            value={details.designation}
            onChange={update('designation')}
            maxLength={60}
            placeholder="e.g. Policy Lead"
            autoComplete="organization-title"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Organisation{' '}
          <span className="font-normal text-white/60">(optional)</span>
          <input
            className={field}
            value={details.organisation}
            onChange={update('organisation')}
            maxLength={60}
            placeholder="e.g. Centre for Social Research"
            autoComplete="organization"
          />
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label
            className={`${button} cursor-pointer bg-white/15 text-white hover:bg-white/25`}
          >
            <ImagePlus className="h-4 w-4" />
            {photo ? 'Change photo' : 'Add a photo'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={choosePhoto}
            />
          </label>
          {photo && (
            <button
              type="button"
              onClick={removePhoto}
              className={`${button} text-white/80 hover:text-white`}
            >
              <X className="h-4 w-4" />
              Remove photo
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-white/60">
          No photo? Your initials go in the circle instead. Your photo stays on
          your device.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={download}
            disabled={!ready || !hasName}
            className={`${button} bg-[#ffd919] text-[#350265] hover:brightness-105`}
          >
            <Download className="h-4 w-4" />
            Download card
          </button>
          {canShareFiles && (
            <button
              type="button"
              onClick={share}
              disabled={!ready || !hasName}
              className={`${button} bg-white text-[#350265] hover:bg-white/90`}
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          )}
        </div>

        <div className="mt-7 rounded-2xl bg-black/20 p-4">
          <p className="text-sm font-semibold">Caption to post with it</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/85">
            {CARD_CAPTION}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyCaption}
              className={`${button} bg-white/15 text-white hover:bg-white/25`}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy caption'}
            </button>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${button} bg-[#0a66c2] text-white hover:brightness-110`}
            >
              <Linkedin className="h-4 w-4" />
              Post on LinkedIn
            </a>
          </div>
          <p className="mt-3 text-xs text-white/60">
            On LinkedIn, download the card first, then add it to your post. Tag
            Centre for Social Research India and Trust &amp; Safety Forum.
          </p>
        </div>
      </div>

      <div className="order-first mx-auto w-full max-w-xs sm:max-w-md lg:sticky lg:top-24 lg:order-none">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-label="Preview of your TASI 2026 card"
          role="img"
          className="h-auto w-full rounded-2xl shadow-2xl shadow-black/40"
        />
        {!ready && (
          <p className="mt-3 text-center text-sm text-white/70">
            Loading your card…
          </p>
        )}
      </div>
    </div>
  );
}
