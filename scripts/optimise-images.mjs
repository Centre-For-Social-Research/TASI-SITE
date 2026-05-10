/**
 * optimise-images.mjs
 * Compresses and resizes source images in public/img in-place.
 * Only processes: jpg, jpeg, png, gif — never touches videos or webp/svg.
 * Run: node scripts/optimise-images.mjs
 * Dry-run: node scripts/optimise-images.mjs --dry
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'public', 'img');
const DRY = process.argv.includes('--dry');

// ── Category rules (maxWidth, maxHeight, quality) ─────────────────────────
const RULES = [
  {
    match: /\/(home-gallery|Exhibition|volunteers)\//i,
    maxW: 1920,
    maxH: 1920,
    q: 82,
  },
  { match: /\/speakers\//i, maxW: 900, maxH: 900, q: 85 },
  { match: /\/(team|endorsements)\//i, maxW: 800, maxH: 800, q: 85 },
  {
    match: /\/(Logo|media-coverage|Speaker Highlights)\//i,
    maxW: 500,
    maxH: 500,
    q: 88,
  },
  { match: /\/travel\//i, maxW: 1600, maxH: 1600, q: 82 },
  { match: /\//, maxW: 1920, maxH: 1920, q: 85 }, // fallback
];

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif']);

function getRule(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return RULES.find((r) => r.match.test(normalized));
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
}

function fmt(bytes) {
  return bytes >= 1_000_000
    ? (bytes / 1_000_000).toFixed(1) + ' MB'
    : (bytes / 1_000).toFixed(0) + ' KB';
}

async function processImage(file) {
  const ext = path.extname(file).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return null;

  const rule = getRule(file);
  const before = fs.statSync(file).size;

  try {
    const img = sharp(file);
    const meta = await img.metadata();

    // Skip if already within limits and small enough (< 200 KB)
    if (
      before < 200_000 &&
      (meta.width || 0) <= rule.maxW &&
      (meta.height || 0) <= rule.maxH
    )
      return null;

    const pipeline = img.resize(rule.maxW, rule.maxH, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    let buf;
    if (ext === '.png') {
      buf = await pipeline
        .png({ quality: rule.q, compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
    } else if (ext === '.gif') {
      buf = await pipeline.gif().toBuffer();
    } else {
      buf = await pipeline
        .jpeg({ quality: rule.q, mozjpeg: true, progressive: true })
        .toBuffer();
    }

    // Only write if we actually made it smaller
    if (buf.length >= before) return null;

    if (!DRY) fs.writeFileSync(file, buf);

    return { file, before, after: buf.length };
  } catch (e) {
    console.error(`  ✗ ${path.relative(ROOT, file)}: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log(
    `\nTASi image optimiser — ${DRY ? 'DRY RUN' : 'LIVE'}\n${'─'.repeat(60)}`
  );

  const files = walk(ROOT);
  const images = files.filter((f) =>
    IMAGE_EXT.has(path.extname(f).toLowerCase())
  );
  console.log(`Found ${images.length} images to check\n`);

  let totalBefore = 0,
    totalAfter = 0,
    count = 0;
  const rows = [];

  for (const file of images) {
    const result = await processImage(file);
    if (!result) continue;
    count++;
    totalBefore += result.before;
    totalAfter += result.after;
    const saved = result.before - result.after;
    const pct = ((saved / result.before) * 100).toFixed(0);
    const rel = path.relative(ROOT, result.file);
    rows.push({
      rel,
      before: fmt(result.before),
      after: fmt(result.after),
      saved: fmt(saved),
      pct,
    });
    console.log(
      `  ✓ ${rel.padEnd(55)} ${fmt(result.before).padStart(8)} → ${fmt(result.after).padStart(8)}  (${pct}% saved)`
    );
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Optimised : ${count} files`);
  console.log(`Before    : ${fmt(totalBefore)}`);
  console.log(`After     : ${fmt(totalAfter)}`);
  console.log(
    `Saved     : ${fmt(totalBefore - totalAfter)}  (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`
  );
  if (DRY) console.log(`\nDry run — no files written. Remove --dry to apply.`);
}

main();
