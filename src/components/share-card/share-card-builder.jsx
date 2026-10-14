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

// The background is the TASI 2026 speaker badge with the photo, name and
// role cleared: the lanyard, logos, "TASI 2026" and the Delhi skyline are
// part of the image. The text below follows the speaker badge layout.
const BACKGROUND_SRC = '/img/share-card/tasi-2026-badge-card-bg.webp';
const WIDTH = 1080;
const HEIGHT = 1350;
const NAVY = '#00327d';
const TEXT = '#383737';
const PHOTO = { cx: 540, cy: 580, r: 195 };
const TEXT_W = 720;
// Fonts only refine the lettering. If they are slow or blocked (Lockdown
// Mode, some in-app browsers), draw with the fallback after this long and
// redraw once they arrive.
const FONT_WAIT_MS = 2500;

// Phones that can share files open the native share sheet (LinkedIn,
// Instagram, WhatsApp) with the card attached. Decided on the client only.
const subscribe = () => () => {};
const getServerCanShareFiles = () => false;
let canShareFilesCache;
const getCanShareFiles = () => {
  if (canShareFilesCache === undefined) {
    // Some in-app browsers throw here instead of returning false.
    try {
      canShareFilesCache =
        typeof navigator.canShare === 'function' &&
        navigator.canShare({
          files: [new File([''], 'card.png', { type: 'image/png' })],
        });
    } catch {
      canShareFilesCache = false;
    }
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
  const { cx, cy, r } = PHOTO;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = NAVY;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    // Cover the circle, keeping the top of the photo where faces usually are.
    const size = r * 2;
    const scale = Math.max(size / photo.width, size / photo.height);
    const w = photo.width * scale;
    const h = photo.height * scale;
    const top = h > size ? cy - r - (h - size) * 0.2 : cy - h / 2;
    ctx.drawImage(photo, cx - w / 2, top, w, h);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 120px ${montserrat.style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initialsFor(name) || 'TASI', cx, cy + 6);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();
}

function drawCard(ctx, background, photo, { name, designation, organisation }) {
  const font = montserrat.style.fontFamily;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';

  drawPhoto(ctx, photo, name);

  // Name in capitals, shrinking to fit one line.
  const displayName = (name.trim() || 'Your Name').toUpperCase();
  const nameSize = fitFontSize(
    (size) => {
      ctx.font = `800 ${size}px ${font}`;
      return ctx.measureText(displayName).width;
    },
    { max: 56, min: 24, maxWidth: TEXT_W }
  );
  ctx.fillStyle = NAVY;
  ctx.font = `800 ${nameSize}px ${font}`;
  ctx.fillText(displayName, WIDTH / 2, 833);

  // Designation (up to two lines) and organisation (one line), as on the
  // speaker badge: "Partner," then "Ikigai Law". Three lines get a smaller
  // size so they stay clear of "I'M ATTENDING".
  const role = designation.trim();
  const org = organisation.trim();
  const layoutLines = (size) => {
    ctx.font = `400 ${size}px ${font}`;
    const measure = (text) => ctx.measureText(text).width;
    let lines = wrapLines(role && org ? `${role},` : role, measure, TEXT_W);
    if (lines.length > 2) {
      lines = [
        lines[0],
        truncateToWidth(lines.slice(1).join(' '), measure, TEXT_W),
      ];
    }
    if (org) lines.push(truncateToWidth(org, measure, TEXT_W));
    return lines;
  };
  let lines = layoutLines(31);
  const compact = lines.length > 2;
  if (compact) lines = layoutLines(27);
  ctx.fillStyle = TEXT;
  lines.forEach((line, index) => {
    ctx.fillText(
      line,
      WIDTH / 2,
      compact ? 874 + index * 32 : 879 + index * 35
    );
  });

  ctx.fillStyle = NAVY;
  ctx.font = `500 31px ${font}`;
  ctx.fillText("I'M ATTENDING #TASI2026", WIDTH / 2, 995);
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
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);
  // '', 'working', 'downloaded' or 'shared': feedback after the buttons.
  const [saveState, setSaveState] = useState('');
  const saveTimerRef = useRef(null);
  const canShareFiles = useSyncExternalStore(
    subscribe,
    getCanShareFiles,
    getServerCanShareFiles
  );

  useEffect(() => {
    let cancelled = false;
    const family = montserrat.style.fontFamily;
    const fonts = Promise.all(
      ['800 56px', '500 31px', '400 31px'].map((spec) =>
        document.fonts ? document.fonts.load(`${spec} ${family}`) : null
      )
    )
      .then(() => {
        if (!cancelled) setFontsLoaded(true);
      })
      .catch(() => {});
    const fontsOrTimeout = Promise.race([
      fonts,
      new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS)),
    ]);

    loadImage(`${BACKGROUND_SRC}${attempt ? `?retry=${attempt}` : ''}`)
      .then(async (template) => {
        await fontsOrTimeout;
        if (cancelled) return;
        templateRef.current = template;
        setLoadFailed(false);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(
    () => () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    },
    []
  );

  // One redraw per frame at most, so fast typing on a phone stays smooth.
  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const frame = requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      drawCard(
        canvasRef.current.getContext('2d'),
        templateRef.current,
        photo,
        details
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, fontsLoaded, photo, details]);

  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  const showSaveState = (state) => {
    clearTimeout(saveTimerRef.current);
    setSaveState(state);
    if (state === 'downloaded' || state === 'shared') {
      saveTimerRef.current = setTimeout(() => setSaveState(''), 6000);
    }
  };

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
    showSaveState('working');
    const blob = await toBlob();
    if (!blob) {
      showSaveState('');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cardFileName(details.name);
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showSaveState('downloaded');
  };

  const share = async () => {
    showSaveState('working');
    const blob = await toBlob();
    if (!blob) {
      showSaveState('');
      return;
    }
    const file = new File([blob], cardFileName(details.name), {
      type: 'image/png',
    });
    try {
      await navigator.share({ files: [file], text: CARD_CAPTION });
      showSaveState('shared');
    } catch {
      // The person closed the share sheet.
      showSaveState('');
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
    'mt-1.5 w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-base text-stone-900 outline-none focus:border-[#ffd919] focus:ring-2 focus:ring-[#ffd919]/40';
  const button =
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1fr_1fr] lg:items-stretch">
      <div className="rounded-xl border border-white/15 bg-white/10 p-6 text-left text-white md:p-8 md:backdrop-blur">
        <p className="mb-6 border-b border-white/15 pb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
          Your details
        </p>
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
            disabled={!ready || !hasName || saveState === 'working'}
            className={`${button} bg-[#ffd919] text-[#350265] hover:brightness-105`}
          >
            {saveState === 'downloaded' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {saveState === 'working'
              ? 'Preparing…'
              : saveState === 'downloaded'
                ? 'Downloaded'
                : 'Download card'}
          </button>
          {canShareFiles && (
            <button
              type="button"
              onClick={share}
              disabled={!ready || !hasName || saveState === 'working'}
              className={`${button} bg-white text-[#350265] hover:bg-white/90`}
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          )}
        </div>
        <p
          role="status"
          aria-live="polite"
          className="mt-3 min-h-[1.25rem] text-sm text-white/80"
        >
          {!hasName && ready
            ? 'Add your name to download your card.'
            : saveState === 'downloaded'
              ? 'Your card is saved. Find it in your Downloads, or in Files or Photos on a phone. Copy the caption below to post it.'
              : saveState === 'shared'
                ? 'Shared. Thanks for spreading the word!'
                : ''}
        </p>
      </div>

      <div className="order-first mx-auto w-full max-w-xs sm:max-w-md lg:order-none">
        <div className="lg:sticky lg:top-24">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            aria-label="Preview of your TASI 2026 card"
            role="img"
            className="h-auto w-full rounded-lg shadow-2xl shadow-black/40"
          />
          {!ready && !loadFailed && (
            <p className="mt-3 text-center text-sm text-white/70">
              Loading your card…
            </p>
          )}
          {!ready && loadFailed && (
            <p className="mt-3 text-center text-sm text-white/80">
              The card could not load. Check your connection and{' '}
              <button
                type="button"
                onClick={() => {
                  setLoadFailed(false);
                  setAttempt((current) => current + 1);
                }}
                className="font-bold text-[#ffd919] underline underline-offset-2"
              >
                try again
              </button>
              .
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/15 bg-white/10 p-6 text-left text-white md:p-8 md:backdrop-blur lg:col-span-2">
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
              Tag Centre for Social Research India and TASI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
