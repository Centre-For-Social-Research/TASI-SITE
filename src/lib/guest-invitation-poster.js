import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const POSTER_WIDTH = 1024;
const POSTER_HEIGHT = 1536;
const POSTER_CENTER_X = POSTER_WIDTH / 2;
const FONT_FILE = path.join(
  process.cwd(),
  'public',
  'fonts',
  'inter',
  'Inter-Regular.ttf'
);

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

function posterTextLines(name) {
  const guestName =
    String(name || 'Guest')
      .trim()
      .split(/\s+/)[0] || 'Guest';
  const textFontSize = guestName.length > 24 ? 34 : 36;

  return [
    {
      y: 370,
      fontSize: textFontSize,
      lines: [`Dear ${guestName},`],
    },
    {
      y: 465,
      fontSize: textFontSize,
      lines: [
        'It would be our privilege to welcome you',
        'as a special guest at the Trust & Safety India',
        'Festival 2026.',
      ],
    },
    {
      y: 665,
      fontSize: textFontSize,
      lines: [
        'Your voice and perspective would add meaning',
        'to the conversations we hope to create.',
        'We would be honoured to have you with us.',
      ],
    },
    {
      y: 885,
      fontSize: textFontSize,
      lines: ['With warm regards,'],
    },
    {
      y: 940,
      fontSize: textFontSize,
      lines: ['Team TASI'],
    },
  ].flatMap(({ y, fontSize, lines }) =>
    lines.map((line, index) => ({
      text: line,
      y: y + index * Math.round(fontSize * 1.4),
      fontSize,
    }))
  );
}

async function renderTextLine({ text, y, fontSize }) {
  let { data, info } = await sharp({
    text: {
      text: `<span foreground="white">${escapeXml(text)}</span>`,
      font: `Inter ${fontSize}`,
      fontfile: FONT_FILE,
      rgba: true,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });

  if (info.width > POSTER_WIDTH - 96) {
    ({ data, info } = await sharp(data)
      .resize({ width: POSTER_WIDTH - 96 })
      .png()
      .toBuffer({ resolveWithObject: true }));
  }

  return {
    input: data,
    top: y - info.height,
    left: Math.round(POSTER_CENTER_X - info.width / 2),
  };
}

export async function buildGuestInvitationPoster({ name }) {
  const background = await getBackground();
  const textLayers = await Promise.all(
    posterTextLines(name).map(renderTextLine)
  );
  const imageBuffer = await sharp(background)
    .composite(textLayers)
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toBuffer();

  return {
    filename: 'TASI-2026-guest-invitation.jpg',
    imageBuffer,
  };
}
