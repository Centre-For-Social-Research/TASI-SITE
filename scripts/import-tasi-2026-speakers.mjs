import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ExcelJS from 'exceljs';
import sharp from 'sharp';
import speakerDirectoryUtils from '../src/lib/speaker-directory-utils.cjs';

const { buildSpeakerSlug } = speakerDirectoryUtils;

const [csvPath, headshotsPath] = process.argv.slice(2);
if (!csvPath || !headshotsPath) {
  throw new Error(
    'Usage: node scripts/import-tasi-2026-speakers.mjs <responses.csv> <headshots-directory>'
  );
}

const outputDirectory = path.resolve('public/img/speakers/2026');
const outputData = path.resolve('src/data/speakers-2026.json');
const photoOverrides = new Map([
  ['Ji-yeon Lee', 'ji - '],
  ['Madelaine Coelho', 'Coelho Headshot TASI 2026'],
  ['Caroline Simangaliso Makumbe', 'Caroline Makumbe - '],
  ['Pragya Misra', 'Pragya (1) - '],
  ['Siddharth P', '8U8A0833 - '],
  ['Rob Lewington', 'Profile - Robert Lewington'],
  ['Snigdha Bhardwaj', 'snigdha 14 - '],
  ['Satviki Varma', 'Satviki.png'],
]);

// The organizer explicitly confirmed permission to publish this profile.
const consentOverrides = new Set(['Smriti Irani']);
const knownPhotoExceptions = new Set(['Uma Submanian']);

const normalize = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(dr|mr|ms|mrs)\.?\s+/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function socialUrl(value, platform) {
  const raw = String(value || '').trim();
  if (!raw || /^n\/?a$/i.test(raw)) return undefined;

  const matchedUrl = raw.match(/https?:\/\/[^\s]+/i);
  const candidate = matchedUrl?.[0] || raw;
  const withProtocol = /^https?:\/\//i.test(candidate)
    ? candidate
    : /^(www\.)?(linkedin\.com|instagram\.com|x\.com|twitter\.com)\//i.test(
          candidate
        )
      ? `https://${candidate}`
      : platform !== 'linkedin' && /^@?[a-zA-Z0-9._]+$/.test(candidate)
        ? `https://${platform === 'x' ? 'x.com' : 'instagram.com'}/${candidate.replace(/^@/, '')}`
        : '';
  if (!withProtocol) return undefined;
  try {
    const url = new URL(withProtocol);
    const allowed = {
      linkedin: ['linkedin.com', 'www.linkedin.com', 'in.linkedin.com'],
      x: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
      instagram: ['instagram.com', 'www.instagram.com'],
    };
    return url.protocol === 'https:' &&
      allowed[platform].includes(url.hostname) &&
      !(platform === 'linkedin' && url.pathname.startsWith('/search/'))
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

const files = (await readdir(headshotsPath)).filter((file) =>
  /\.(jpe?g|png|webp)$/i.test(file)
);
const workbook = new ExcelJS.Workbook();
const sheet = await workbook.csv.readFile(csvPath);
const headers = sheet
  .getRow(1)
  .values.slice(1)
  .map((value) => String(value || '').trim());
const records = [];
const usedPhotos = new Set();
const usedSlugs = new Set();
const missingPhotos = [];

for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
  const values = sheet.getRow(rowIndex).values;
  const row = Object.fromEntries(
    headers.map((header, index) => [
      header,
      String(values[index + 1] || '').trim(),
    ])
  );
  const name = row['Full name (as it should be published)'];
  if (!name) continue;
  if (
    row['Consent for Use of Profile Information'] !== 'I Agree' &&
    !consentOverrides.has(name)
  ) {
    throw new Error(`Profile-use consent is missing for ${name}`);
  }

  const slug = buildSpeakerSlug(name);
  if (!slug || usedSlugs.has(slug))
    throw new Error(`Duplicate speaker: ${name}`);
  usedSlugs.add(slug);

  const override = photoOverrides.get(name);
  const candidates = files.filter((file) =>
    override
      ? file.startsWith(override)
      : normalize(file).includes(normalize(name))
  );
  if (
    candidates.length > 1 ||
    (candidates.length === 0 && !knownPhotoExceptions.has(name))
  ) {
    throw new Error(
      `${name}: expected one headshot, found ${candidates.length}`
    );
  }

  let photo = '';
  if (candidates.length === 1) {
    const file = candidates[0];
    if (usedPhotos.has(file))
      throw new Error(`Headshot matched twice: ${file}`);
    usedPhotos.add(file);
    await mkdir(outputDirectory, { recursive: true });
    const outputFile = path.join(outputDirectory, `${slug}.webp`);
    await sharp(path.join(headshotsPath, file))
      .rotate()
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toFile(outputFile);
    photo = `/img/speakers/2026/${slug}.webp`;
  } else if (name === 'Uma Submanian') {
    // Same RATI co-founder has a verified image already used in the 2025 directory.
    photo = '/img/speakers/Uma Subramanian.webp';
  } else {
    missingPhotos.push(name);
  }

  records.push({
    name,
    designation: row['Current Designation / Job Title'],
    organisation: row['Organisation'],
    country: row['Country'],
    category: row['Which category best describes you?'],
    bio: row[
      'Professional Bio (Please provide a brief professional biography).'
    ],
    photo,
    linkedinUrl: socialUrl(row['LinkedIn profile URL'], 'linkedin'),
    xUrl: socialUrl(row['X (Twitter) profile URL'], 'x'),
    instagramUrl: socialUrl(row['Instagram profile URL'], 'instagram'),
    edition: '2026',
  });
}

records.sort((a, b) => a.name.localeCompare(b.name, 'en'));
await writeFile(outputData, `${JSON.stringify(records, null, 2)}\n`);
console.log(
  `Imported ${records.length} speakers, ${usedPhotos.size} supplied headshots; initials fallback: ${missingPhotos.join(', ') || 'none'}.`
);
