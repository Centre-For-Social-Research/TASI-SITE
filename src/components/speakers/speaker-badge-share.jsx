'use client';

import { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from 'lucide-react';

const PLATFORMS = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: '#0a66c2',
    hint: 'LinkedIn opens with this caption ready. Type @ before Centre for Social Research India and TASI Festival to tag them, then add your badge image.',
  },
  {
    key: 'x',
    label: 'X',
    icon: Twitter,
    color: '#000000',
    hint: 'X opens with this caption ready. Your badge shows as the link preview.',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    color: '#1877f2',
    hint: 'Facebook does not allow pre-filled captions, so we copy it for you. Paste it into your post.',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: '#c13584',
    hint: 'Instagram has no share link. We copy the caption and open your phone’s share sheet with the badge. Pick Instagram, then paste the caption.',
  },
];

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function SpeakerBadgeShare({
  name,
  imageUrl,
  downloadUrl,
  captions,
  links,
  highlight,
}) {
  const [platform, setPlatform] = useState(highlight || 'linkedin');
  const [message, setMessage] = useState('');
  const active = PLATFORMS.find((item) => item.key === platform);

  function flash(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 4000);
  }

  async function copyCaption(key = platform) {
    const copied = await copyText(captions[key]);
    flash(copied ? 'Caption copied.' : 'Select the caption and copy it.');
  }

  // Copies first, then lets the link open in the same tap so pop-up
  // blockers treat it as a user action.
  function onPlatformClick(key) {
    setPlatform(key);
    copyText(captions[key]).then((copied) => {
      if (copied && key !== 'x')
        flash('Caption copied. Paste it into your post.');
    });
  }

  async function shareToInstagram() {
    setPlatform('instagram');
    await copyText(captions.instagram);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'tasi-speaker-badge.png', {
        type: blob.type || 'image/png',
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: captions.instagram });
        return;
      }
    } catch {
      // Share sheet dismissed or unsupported; fall through to the hint.
    }
    flash(
      'Caption copied. Download your badge, then post it on Instagram and paste the caption.'
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 md:grid-cols-[minmax(0,380px)_1fr] md:px-6 md:py-14">
      <div className="grid content-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- private badge served by a token route */}
        <img
          src={imageUrl}
          alt={`${name} speaker badge`}
          className="w-full rounded-[10px] border border-stone-200 shadow-sm dark:border-stone-700"
        />
        <a
          href={downloadUrl}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#022d5d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#043b78]"
        >
          <Download className="h-4 w-4" /> Download your badge
        </a>
      </div>

      <div className="grid content-start gap-5">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
            Share that you are speaking
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-300">
            Tap a platform to post. The caption is copied for you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PLATFORMS.map(({ key, label, icon: Icon, color }) =>
            key === 'instagram' ? (
              <button
                key={key}
                type="button"
                onClick={shareToInstagram}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] px-3 py-3 text-sm font-semibold text-white"
                style={{
                  background: color,
                  outline: platform === key ? `3px solid ${color}55` : 'none',
                }}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ) : (
              <a
                key={key}
                href={links[key]}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onPlatformClick(key)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] px-3 py-3 text-sm font-semibold text-white"
                style={{
                  background: color,
                  outline: platform === key ? `3px solid ${color}55` : 'none',
                }}
              >
                <Icon className="h-4 w-4" /> {label}
              </a>
            )
          )}
        </div>

        <div className="rounded-[10px] border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-900">
          <div className="mb-3 flex flex-wrap gap-2">
            {PLATFORMS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPlatform(key)}
                className={`rounded-[10px] px-3 py-1.5 text-xs font-semibold ${
                  platform === key
                    ? 'bg-[#022d5d] text-white'
                    : 'bg-white text-stone-700 dark:bg-stone-800 dark:text-stone-200'
                }`}
              >
                {label} caption
              </button>
            ))}
          </div>
          <p className="whitespace-pre-line text-sm leading-6 text-stone-800 dark:text-stone-100">
            {captions[platform]}
          </p>
          <button
            type="button"
            onClick={() => copyCaption()}
            className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          >
            {message ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy caption
          </button>
          <p className="mt-3 text-xs leading-5 text-stone-500 dark:text-stone-400">
            {active?.hint}
          </p>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="min-h-5 text-sm font-medium text-[#022d5d] dark:text-sky-300"
        >
          {message}
        </p>
      </div>
    </section>
  );
}
