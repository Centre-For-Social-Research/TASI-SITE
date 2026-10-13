'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
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

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
});

// The background is the attendee QR pass artwork: the logo box at the top
// and the India Gate illustration at the bottom are part of the image.
const BACKGROUND_SRC = '/img/share-card/tasi-2026-attendee-card-bg.webp';
const WIDTH = 1080;
const HEIGHT = 1350;
const YELLOW = '#ffd919';
const INK = '#2a0b4a';
const MUTED = '#5b4a6b';
const INDIGO = '#2e0fa3';
const TAG_BG = '#350265';
// Name card: white panel with a round photo on the left.
const CARD = { x: 130, y: 555, w: 820, padX: 40, padY: 34 };
const PHOTO_R = 85;
const TEXT_X = CARD.x + CARD.padX + PHOTO_R * 2 + 34;
const TEXT_W = CARD.x + CARD.w - CARD.padX - TEXT_X;

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

function drawPhoto(ctx, photo, name, cx, cy) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, PHOTO_R, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    // Cover the circle, keeping the top of the photo where faces usually are.
    const size = PHOTO_R * 2;
    const scale = Math.max(size / photo.width, size / photo.height);
    const w = photo.width * scale;
    const h = photo.height * scale;
    const top = h > size ? cy - PHOTO_R - (h - size) * 0.2 : cy - h / 2;
    ctx.drawImage(photo, cx - w / 2, top, w, h);
  } else {
    ctx.fillStyle = INDIGO;
    ctx.fillRect(cx - PHOTO_R, cy - PHOTO_R, PHOTO_R * 2, PHOTO_R * 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 64px ${outfit.style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initialsFor(name) || 'TASI', cx, cy + 3);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, PHOTO_R - 3, 0, Math.PI * 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = YELLOW;
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCard(ctx, background, photo, { name, designation, organisation }) {
  const display = outfit.style.fontFamily;
  const body = jakarta.style.fontFamily;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
  ctx.textBaseline = 'alphabetic';

  // "SEE YOU AT" and "TASI 2026".
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = `700 34px ${display}`;
  ctx.letterSpacing = '11px';
  ctx.fillText('SEE YOU AT', WIDTH / 2 + 5, 366);
  ctx.letterSpacing = '-2px';
  ctx.font = `900 124px ${display}`;
  const first = 'TASI ';
  const second = '2026';
  const firstW = ctx.measureText(first).width;
  const total = firstW + ctx.measureText(second).width;
  ctx.textAlign = 'left';
  const startX = (WIDTH - total) / 2;
  ctx.fillText(first, startX, 474);
  ctx.fillStyle = YELLOW;
  ctx.fillText(second, startX + firstW, 474);
  ctx.letterSpacing = '0px';

  // Name, then designation and organisation wrapped to at most two lines.
  const displayName = name.trim() || 'Your Name';
  const nameSize = fitFontSize(
    (size) => {
      ctx.font = `800 ${size}px ${display}`;
      return ctx.measureText(displayName).width;
    },
    { max: 50, min: 32, maxWidth: TEXT_W }
  );
  ctx.font = `500 27px ${body}`;
  const measure = (text) => ctx.measureText(text).width;
  const detail = [designation, organisation]
    .map((text) => text.trim())
    .filter(Boolean)
    .join(', ');
  const wrapped = wrapLines(detail, measure, TEXT_W);
  const lines = wrapped.slice(0, 2);
  if (wrapped.length > 2) {
    lines[1] = truncateToWidth(wrapped.slice(1).join(' '), measure, TEXT_W);
  }

  const textH = nameSize + (lines.length ? 8 + lines.length * 35 : 0) + 16 + 40;
  const innerH = Math.max(PHOTO_R * 2, textH);
  const cardH = innerH + CARD.padY * 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 26;
  roundRect(ctx, CARD.x, CARD.y, CARD.w, cardH, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  const midY = CARD.y + cardH / 2;
  drawPhoto(ctx, photo, name, CARD.x + CARD.padX + PHOTO_R, midY);

  let y = midY - textH / 2 + nameSize * 0.82;
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = `800 ${nameSize}px ${display}`;
  ctx.fillText(displayName, TEXT_X, y);
  ctx.fillStyle = MUTED;
  ctx.font = `500 27px ${body}`;
  y += nameSize * 0.18 + 8;
  lines.forEach((line) => {
    y += 30;
    ctx.fillText(line, TEXT_X, y);
    y += 5;
  });

  // "I'M ATTENDING" tag.
  ctx.font = `700 23px ${body}`;
  ctx.letterSpacing = '3px';
  const tag = "I'M ATTENDING";
  const tagW = ctx.measureText(tag).width + 32;
  const tagY = y + 16;
  ctx.fillStyle = TAG_BG;
  roundRect(ctx, TEXT_X, tagY, tagW, 40, 2);
  ctx.fill();
  ctx.fillStyle = YELLOW;
  ctx.fillText(tag, TEXT_X + 16, tagY + 28);
  ctx.letterSpacing = '0px';

  // Dates, venue and hashtag under the card.
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 31px ${body}`;
  ctx.letterSpacing = '3px';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 12;
  ctx.fillText(
    '14–15 OCTOBER · IIC, NEW DELHI · #TASI2026',
    WIDTH / 2,
    Math.max(860, CARD.y + cardH + 56)
  );
  ctx.restore();
  ctx.letterSpacing = '0px';
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
      loadImage(BACKGROUND_SRC),
      document.fonts.load(`900 124px ${outfit.style.fontFamily}`),
      document.fonts.load(`800 50px ${outfit.style.fontFamily}`),
      document.fonts.load(`700 34px ${outfit.style.fontFamily}`),
      document.fonts.load(`500 27px ${jakarta.style.fontFamily}`),
      document.fonts.load(`700 31px ${jakarta.style.fontFamily}`),
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
    <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1fr_1fr] lg:items-stretch">
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
      </div>

      <div className="order-first mx-auto w-full max-w-xs sm:max-w-md lg:order-none">
        <div className="lg:sticky lg:top-24">
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

      <div className="rounded-xl border border-white/15 bg-white/10 p-6 text-left text-white backdrop-blur md:p-8 lg:col-span-2">
        <p className="border-b border-white/15 pb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
          Caption to post with it
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
          <p className="whitespace-pre-line border-l-2 border-[#ffd919] pl-5 text-[15px] leading-relaxed text-white/90">
            {CARD_CAPTION}
          </p>
          <div className="lg:w-72">
            <div className="grid gap-3">
              <button
                type="button"
                onClick={copyCaption}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#350265] transition hover:bg-white/90"
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a66c2] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                <Linkedin className="h-4 w-4" />
                Post on LinkedIn
              </a>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/60">
              On LinkedIn, download the card first, then add it to your post.
              Tag Centre for Social Research India and Trust &amp; Safety Forum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
