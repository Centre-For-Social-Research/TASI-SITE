import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import certificateUtils from './certificate-utils.cjs';

const { buildVerifyUrl, formatIssueDate, getCertificateEdition } =
  certificateUtils;

// A4 landscape in PDF points; layout is specified in millimetres from the
// top-left corner, matching the approved mockup.
const PAGE_W = 841.89;
const PAGE_H = 595.28;
const MM = 72 / 25.4;
const x = (mm) => mm * MM;
const y = (mm) => PAGE_H - mm * MM;

const NAVY = rgb(2 / 255, 45 / 255, 93 / 255);
const PURPLE = rgb(67 / 255, 53 / 255, 138 / 255);
const INK = rgb(32 / 255, 33 / 255, 36 / 255);
const BODY = rgb(60 / 255, 64 / 255, 67 / 255);
const MUTED = rgb(95 / 255, 99 / 255, 104 / 255);
const RULE = rgb(218 / 255, 220 / 255, 224 / 255);

// The template holds the border, background microtext, logo, signature and
// skyline. It is a private server asset, never served from public/.
const ASSET_DIR = path.join(process.cwd(), 'src', 'assets', 'certificates');
let assetCache = null;

async function loadAssets() {
  if (!assetCache) {
    const read = (file) => fs.readFile(path.join(ASSET_DIR, file));
    const [template, regular, semibold, bold, display] = await Promise.all([
      read('tasi-2026-attendee-template.jpg'),
      read('fonts/Inter-Regular.ttf'),
      read('fonts/Inter-SemiBold.ttf'),
      read('fonts/Inter-Bold.ttf'),
      read('fonts/PlayfairDisplay-Bold.ttf'),
    ]);
    assetCache = { template, regular, semibold, bold, display };
  }
  return assetCache;
}

function drawCentered(page, text, { font, size, top, color, tracking = 0 }) {
  const width =
    font.widthOfTextAtSize(text, size) + tracking * (text.length - 1);
  if (!tracking) {
    page.drawText(text, {
      x: PAGE_W / 2 - width / 2,
      y: y(top),
      size,
      font,
      color,
    });
    return;
  }
  // pdf-lib has no letter-spacing, so tracked text is set glyph by glyph.
  let cursor = PAGE_W / 2 - width / 2;
  for (const ch of text) {
    page.drawText(ch, { x: cursor, y: y(top), size, font, color });
    cursor += font.widthOfTextAtSize(ch, size) + tracking;
  }
}

// One centred line made of plain and bold runs.
function drawRuns(page, runs, { top, size }) {
  const width = runs.reduce(
    (sum, run) => sum + run.font.widthOfTextAtSize(run.text, size),
    0
  );
  let cursor = PAGE_W / 2 - width / 2;
  for (const run of runs) {
    page.drawText(run.text, {
      x: cursor,
      y: y(top),
      size,
      font: run.font,
      color: run.color,
    });
    cursor += run.font.widthOfTextAtSize(run.text, size);
  }
}

function fitSize(font, text, { max, min, maxWidth }) {
  let size = max;
  while (size > min && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5;
  }
  return size;
}

function drawRight(page, text, { font, size, right, top, color }) {
  page.drawText(text, {
    x: x(right) - font.widthOfTextAtSize(text, size),
    y: y(top),
    size,
    font,
    color,
  });
}

/**
 * Renders one attendee certificate.
 * @param {{ name: string, code: string, edition?: string, issuedAt: string, siteUrl?: string, sample?: boolean }} input
 * @returns {Promise<Uint8Array>}
 */
export async function renderCertificatePdf({
  name,
  code,
  edition = '2026',
  issuedAt,
  siteUrl,
  sample = false,
}) {
  const config = getCertificateEdition(edition);
  if (!config) throw new Error(`Edition ${edition} is not configured.`);
  const assets = await loadAssets();
  const verifyUrl = buildVerifyUrl({ siteUrl, code });

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [regular, semibold, bold, display, background] = await Promise.all([
    doc.embedFont(assets.regular, { subset: false }),
    doc.embedFont(assets.semibold, { subset: false }),
    doc.embedFont(assets.bold, { subset: false }),
    doc.embedFont(assets.display, { subset: false }),
    doc.embedJpg(assets.template),
  ]);

  doc.setTitle(`${config.title}: ${name}`);
  doc.setAuthor('Centre for Social Research');
  doc.setSubject(`${config.eventName}, ${config.dates}`);
  doc.setKeywords([config.shortName, 'certificate', code]);
  doc.setCreator('trustandsafetyindia.org');
  doc.setProducer('TASI certificates');
  // Fixed dates keep the file byte-for-byte identical on every download,
  // so its SHA-256 fingerprint can be checked later.
  doc.setCreationDate(new Date(issuedAt));
  doc.setModificationDate(new Date(issuedAt));

  const page = doc.addPage([PAGE_W, PAGE_H]);
  page.drawImage(background, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });

  // Personal microtext: the holder's name and certificate ID in a fine line
  // just inside the top and bottom of the border. Too small to retype
  // cleanly, and it must match the name and ID printed above. Along the
  // bottom it stops either side of the skyline (66–231 mm).
  const micro = `${name.toUpperCase()} · ${code} · `;
  const microSize = 4.2;
  const microColor = rgb(67 / 255, 53 / 255, 138 / 255);
  const microRun = (left, width, top) => {
    let line = micro.repeat(
      Math.ceil(x(width) / regular.widthOfTextAtSize(micro, microSize)) + 1
    );
    while (regular.widthOfTextAtSize(line, microSize) > x(width)) {
      line = line.slice(0, -1);
    }
    page.drawText(line, {
      x: x(left),
      y: y(top),
      size: microSize,
      font: regular,
      color: microColor,
      opacity: 0.55,
    });
  };
  microRun(10, 277, 9.6);
  microRun(10, 52, 201.6);
  microRun(235, 52, 201.6);

  drawCentered(page, config.title.toUpperCase(), {
    font: semibold,
    size: 12,
    top: 56,
    color: PURPLE,
    tracking: 3.8,
  });
  drawCentered(page, 'This is to certify that', {
    font: regular,
    size: 12.5,
    top: 68,
    color: MUTED,
  });

  const nameSize = fitSize(display, name, {
    max: 36,
    min: 20,
    maxWidth: x(215),
  });
  drawCentered(page, name, {
    font: display,
    size: nameSize,
    top: 86,
    color: NAVY,
  });
  page.drawLine({
    start: { x: PAGE_W / 2 - x(60), y: y(93) },
    end: { x: PAGE_W / 2 + x(60), y: y(93) },
    thickness: 0.6,
    color: RULE,
  });

  const plain = (text) => ({ text, font: regular, color: BODY });
  const strong = (text) => ({ text, font: semibold, color: INK });
  drawRuns(
    page,
    [plain('participated in the '), strong(config.eventName), plain(',')],
    { top: 103, size: 12.5 }
  );
  drawRuns(
    page,
    [plain('held on '), strong(config.dates), plain(` at ${config.venue},`)],
    { top: 110.5, size: 12.5 }
  );
  drawRuns(page, [plain(`organised by ${config.organisers}.`)], {
    top: 118,
    size: 12.5,
  });

  // Signature block: the signature itself is part of the template.
  page.drawLine({
    start: { x: x(29), y: y(152) },
    end: { x: x(91), y: y(152) },
    thickness: 0.6,
    color: BODY,
  });
  page.drawText(config.signatory, {
    x: x(29),
    y: y(158),
    size: 11,
    font: bold,
    color: INK,
  });
  page.drawText(config.signatoryRole, {
    x: x(29),
    y: y(162.5),
    size: 9.5,
    font: regular,
    color: MUTED,
  });

  // Verification block: ID, link and a QR code to the public verify page.
  const qr = await doc.embedPng(
    await QRCode.toBuffer(verifyUrl, {
      type: 'png',
      margin: 0,
      width: 600,
      errorCorrectionLevel: 'M',
      color: { dark: '#022d5d', light: '#ffffff' },
    })
  );
  page.drawImage(qr, { x: x(247), y: y(165), width: x(21), height: x(21) });
  drawRight(page, `Certificate ID: ${code}`, {
    font: semibold,
    size: 9,
    right: 243,
    top: 154,
    color: INK,
  });
  drawRight(
    page,
    `Verify at ${buildVerifyUrl({ siteUrl, code: '' })
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')}`,
    {
      font: regular,
      size: 8,
      right: 243,
      top: 158.5,
      color: MUTED,
    }
  );
  drawRight(page, `Issued ${formatIssueDate(issuedAt)}`, {
    font: regular,
    size: 8,
    right: 243,
    top: 163,
    color: MUTED,
  });

  if (sample) {
    page.drawText('SAMPLE', {
      x: x(80),
      y: y(130),
      size: 120,
      font: bold,
      color: rgb(0.85, 0.2, 0.25),
      opacity: 0.18,
      rotate: { type: 'degrees', angle: 18 },
    });
  }

  return doc.save({ useObjectStreams: true });
}
