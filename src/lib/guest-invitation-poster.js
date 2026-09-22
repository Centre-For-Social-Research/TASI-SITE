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
  const textFontSize = guestName.length > 24 ? 34 : 36;

  return Buffer.from(`<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${centeredText({
      y: 370,
      fontSize: textFontSize,
      lines: [`Dear ${guestName},`],
    })}
    ${centeredText({
      y: 465,
      fontSize: textFontSize,
      lines: [
        'It would be our privilege to welcome you',
        'as a special guest at the Trust & Safety India',
        'Festival 2026.',
      ],
    })}
    ${centeredText({
      y: 665,
      fontSize: textFontSize,
      lines: [
        'Your voice and perspective would add meaning',
        'to the conversations we hope to create.',
        'We would be honoured to have you with us.',
      ],
    })}
    ${centeredText({
      y: 885,
      fontSize: textFontSize,
      lines: ['With warm regards,'],
    })}
    ${centeredText({
      y: 940,
      fontSize: textFontSize,
      lines: ['Team TASI'],
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
