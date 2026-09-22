import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const POSTER_WIDTH = 1024;
const POSTER_HEIGHT = 1536;
const POSTER_CENTER_X = POSTER_WIDTH / 2;

let cachedBackground = null;

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function getBackground() {
  if (cachedBackground) {
    return cachedBackground;
  }

  cachedBackground = await fs.readFile(
    path.join(
      process.cwd(),
      'public',
      'img',
      'tasi-guest-invitation-background.png'
    )
  );
  return cachedBackground;
}

function centeredText({ y, fontSize, lines, fontWeight = 400 }) {
  return `<text x="${POSTER_CENTER_X}" y="${y}" fill="#ffffff" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}">${lines
    .map(
      (line, index) =>
        `<tspan x="${POSTER_CENTER_X}" dy="${index === 0 ? 0 : Math.round(fontSize * 1.4)}">${escapeXml(line)}</tspan>`
    )
    .join('')}</text>`;
}

function buildPosterTextOverlay(name) {
  const guestName = String(name || 'Guest').trim() || 'Guest';
  const greetingFontSize = guestName.length > 24 ? 36 : 42;

  return Buffer.from(`<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${centeredText({
      y: 370,
      fontSize: greetingFontSize,
      lines: [`Dear ${guestName},`],
    })}
    ${centeredText({
      y: 455,
      fontSize: 36,
      lines: [
        'It would be our privilege to welcome you',
        'as a special guest at the Trust & Safety India',
        'Festival 2026.',
      ],
    })}
    ${centeredText({
      y: 650,
      fontSize: 34,
      lines: [
        'Your voice and perspective would add meaning',
        'to the conversations we hope to create.',
        'We would be honoured to have you with us.',
      ],
    })}
    ${centeredText({
      y: 880,
      fontSize: 34,
      lines: ['With warm regards,'],
    })}
    ${centeredText({
      y: 935,
      fontSize: 38,
      fontWeight: 600,
      lines: ['Team TASI'],
    })}
    <circle cx="${POSTER_CENTER_X}" cy="1118" r="48" fill="#d9b45c" fill-opacity="0.18" stroke="#f7df9d" stroke-opacity="0.78" stroke-width="2"/>
    <circle cx="${POSTER_CENTER_X}" cy="1118" r="40" fill="none" stroke="#ffffff" stroke-opacity="0.32" stroke-width="1"/>
    ${centeredText({
      y: 1114,
      fontSize: 20,
      fontWeight: 600,
      lines: ['TASI'],
    })}
    ${centeredText({
      y: 1135,
      fontSize: 13,
      fontWeight: 600,
      lines: ['2026'],
    })}
  </svg>`);
}

export async function buildGuestInvitationPoster({ name }) {
  const background = await getBackground();
  const imageBuffer = await sharp(background)
    .composite([{ input: buildPosterTextOverlay(name), top: 0, left: 0 }])
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toBuffer();

  return {
    filename: 'TASI-2026-guest-invitation.jpg',
    imageBuffer,
  };
}
