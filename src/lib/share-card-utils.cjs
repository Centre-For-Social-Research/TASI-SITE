// Text helpers for the "I'm attending #TASI2026" card. Measuring is passed
// in, so the same logic runs on a canvas in the browser and in tests.

const CARD_CAPTION = `I'm attending #TASI2026, the Trust & Safety India Festival, on 14-15 October at the India International Centre, New Delhi.

Two days of conversations on online safety, AI and digital rights with the people working on them. See you there!

#TASI2026 #TrustAndSafety #OnlineSafety`;

function initialsFor(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// Largest size from max down to min whose measured width fits.
function fitFontSize(measureAt, { max, min, maxWidth }) {
  for (let size = max; size > min; size -= 2) {
    if (measureAt(size) <= maxWidth) return size;
  }
  return min;
}

// Wraps text on spaces to fit maxWidth; a single over-long word is kept whole.
function wrapLines(text, measure, maxWidth) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Shortens text to fit maxWidth, ending with an ellipsis when cut.
function truncateToWidth(text, measure, maxWidth) {
  const value = String(text || '').trim();
  if (measure(value) <= maxWidth) return value;
  let cut = value;
  while (cut.length > 1 && measure(`${cut}…`) > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut.trimEnd()}…`;
}

function cardFileName(name) {
  const slug = String(name || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `tasi-2026-${slug || 'attending'}.png`;
}

module.exports = {
  CARD_CAPTION,
  cardFileName,
  fitFontSize,
  initialsFor,
  truncateToWidth,
  wrapLines,
};
