import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const photos = [
  'public/img/home-gallery/7T7A5237-new.webp',
  'public/img/home-gallery/7T7A5102.webp',
  'public/img/home-gallery/7T7A0651.webp',
  'public/img/Exhibition/7T7A3136.webp',
  'public/img/home-gallery/7T7A2027.webp',
  'public/img/media-coverage/press-conference/gcv-06833.webp',
  'public/img/Exhibition/7T7A3132.webp',
  'public/img/home-gallery/IMG_6768.webp',
  'public/img/home-gallery/7T7A3087.webp',
  'public/img/media-coverage/press-conference/gcv-07089.webp',
  'public/img/volunteers/volunteer-lobby.webp',
  'public/img/volunteers/volunteer-checkin.webp',
  'public/img/media-coverage/press-conference/gcv-07061.webp',
  'public/img/home-gallery/7T7A3581.webp',
  'public/img/volunteers/volunteer-badges.webp',
  'public/img/Exhibition/IMG_5848fwe.webp',
];

const pngConversions = [
  {
    source: 'public/img/home-gallery/tasi-2025-jaishankar-keynote.png',
    target: 'public/img/home-gallery/tasi-2025-jaishankar-keynote.webp',
  },
  {
    source: 'public/img/home-gallery/tasi-2026-brochure-3.png',
    target: 'public/img/home-gallery/tasi-2026-brochure-3.webp',
  },
];

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

async function encodeWebp(source, quality = 78) {
  const input = await readFile(source);

  return sharp(input)
    .rotate()
    .resize({
      width: 1920,
      height: 1920,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 5, smartSubsample: true })
    .toBuffer();
}

let bytesBefore = 0;
let bytesAfter = 0;

for (const relativePath of photos) {
  const filePath = path.join(projectRoot, relativePath);
  const before = (await stat(filePath)).size;
  const metadata = await sharp(filePath).metadata();

  if (metadata.width <= 1920 && metadata.height <= 1920) {
    console.log(`Skipped ${relativePath} (already optimized)`);
    continue;
  }

  const output = await encodeWebp(filePath);
  await writeFile(filePath, output);

  bytesBefore += before;
  bytesAfter += output.length;
  console.log(
    `Optimized ${relativePath}: ${formatBytes(before)} -> ${formatBytes(output.length)}`
  );
}

for (const { source, target } of pngConversions) {
  const sourcePath = path.join(projectRoot, source);
  const targetPath = path.join(projectRoot, target);
  const before = (await stat(sourcePath)).size;
  const output = await encodeWebp(sourcePath, 88);

  await writeFile(targetPath, output);
  bytesBefore += before;
  bytesAfter += output.length;
  console.log(
    `Converted ${source}: ${formatBytes(before)} -> ${formatBytes(output.length)}`
  );
}

if (bytesBefore > 0) {
  const savedPercent = ((1 - bytesAfter / bytesBefore) * 100).toFixed(1);
  console.log(
    `Saved ${formatBytes(bytesBefore - bytesAfter)} (${savedPercent}%) across processed assets.`
  );
}
