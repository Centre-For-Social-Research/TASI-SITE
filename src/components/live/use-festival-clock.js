'use client';

import { useSyncExternalStore } from 'react';

const TICK_MS = 30 * 1000;

// `?live-preview=2026-10-14T10:20` starts the clock at that IST moment and
// lets it run from there, so the live views can be checked before the event.
let preview = { value: null, offset: 0 };

function getPreviewOffset() {
  const value = new URLSearchParams(window.location.search).get('live-preview');
  if (value === preview.value) return preview.offset;

  let offset = 0;
  if (value) {
    const hasZone = /Z$|[+-]\d{2}:\d{2}$/.test(value);
    const target = Date.parse(hasZone ? value : `${value}+05:30`);
    if (Number.isFinite(target)) offset = target - Date.now();
  }
  preview = { value, offset };
  return offset;
}

function subscribe(onChange) {
  const id = window.setInterval(onChange, TICK_MS);
  return () => window.clearInterval(id);
}

// Rounded to the tick so the snapshot is stable between renders.
function getSnapshot() {
  const now = Date.now() + getPreviewOffset();
  return Math.floor(now / TICK_MS) * TICK_MS;
}

// The server never renders live content, so static HTML is unchanged and
// there is nothing to mismatch on hydration.
function getServerSnapshot() {
  return null;
}

export function useFestivalClock() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
