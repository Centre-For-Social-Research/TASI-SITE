// One-off import of an edition's speaker badges (and, optionally, emails)
// into the admin Speaker Communications tab. Later badges can be uploaded
// from the tab itself; this is for loading a whole folder at once.
//
// Usage:
//   node scripts/import-speaker-badges.mjs --dir <badge folder> [--emails <sheet.xlsx>] [--edition 2026] [--apply]
//
// Badge files must be named after the speaker ("Yoel Roth.png"). The
// optional sheet needs "Name" and "Email" columns; several addresses may be
// separated by commas. Without --apply the script only prints what it would
// do. Existing emails are never overwritten.
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';

const require = createRequire(import.meta.url);
const {
  buildSpeakerNameKey,
  normalizeEdition,
  parseSpeakerEmails,
  speakerNameFromFilename,
} = require('../src/lib/speaker-communications-utils.cjs');

const BUCKET = 'speaker-badges';

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

const dir = arg('dir');
const emailsFile = arg('emails');
const edition = normalizeEdition(arg('edition'));
const apply = process.argv.includes('--apply');
if (!dir) {
  console.error('Pass --dir <folder of badge images>.');
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => [
      line.slice(0, line.indexOf('=')).trim(),
      line
        .slice(line.indexOf('=') + 1)
        .trim()
        .replace(/^["']|["']$/g, ''),
    ])
);
const supabase = createClient(
  env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function readEmailSheet(file) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  const sheet = workbook.worksheets[0];
  const headers = {};
  sheet.getRow(1).eachCell((cell, column) => {
    headers[String(cell.value || '').toLowerCase()] = column;
  });
  const nameColumn = Object.entries(headers).find(([h]) =>
    h.includes('name')
  )?.[1];
  const emailColumn = headers.email;
  if (!nameColumn || !emailColumn) {
    throw new Error('The sheet needs "Name" and "Email" columns.');
  }
  const emails = new Map();
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const name = String(row.getCell(nameColumn).text || '').trim();
    const email = String(row.getCell(emailColumn).text || '').trim();
    if (name && email) emails.set(buildSpeakerNameKey(name), email);
  });
  return emails;
}

const emailsByKey = emailsFile ? await readEmailSheet(emailsFile) : new Map();
const files = readdirSync(dir).filter((file) => /\.(png|jpe?g)$/i.test(file));
const counts = { created: 0, updated: 0, withEmail: 0, failed: 0 };

console.log(
  `${apply ? 'Importing' : 'Dry run:'} ${files.length} badges into TASI ${edition}\n`
);

for (const file of files) {
  const name = speakerNameFromFilename(file);
  const nameKey = buildSpeakerNameKey(name);
  try {
    const buffer = readFileSync(path.join(dir, file));
    const isPng = buffer.subarray(1, 4).toString('latin1') === 'PNG';
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
    if (!isPng && !isJpeg) throw new Error('not a PNG or JPEG image');
    if (buffer.length > 3 * 1024 * 1024) throw new Error('larger than 3 MB');
    const extension = isPng ? 'png' : 'jpg';
    const contentType = isPng ? 'image/png' : 'image/jpeg';
    const sheetEmails = emailsByKey.has(nameKey)
      ? parseSpeakerEmails(emailsByKey.get(nameKey))
      : [];

    const { data: existing, error: lookupError } = await supabase
      .from('speaker_badges')
      .select('id,emails,status')
      .eq('edition', edition)
      .eq('name_key', nameKey)
      .maybeSingle();
    // A dry run may happen before the migration; treat every speaker as new.
    const tableMissing =
      !apply && /does not exist|schema cache/i.test(lookupError?.message || '');
    if (lookupError && !tableMissing) throw new Error(lookupError.message);
    if (existing?.status === 'sending') {
      throw new Error('a send is unresolved; skipped');
    }

    const emails = existing?.emails?.length ? existing.emails : sheetEmails;
    console.log(
      `${existing ? 'update' : 'create'}  ${name.padEnd(32)} ${emails.join(', ') || '(no email)'}`
    );
    if (emails.length) counts.withEmail += 1;
    if (!apply) {
      counts[existing ? 'updated' : 'created'] += 1;
      continue;
    }

    const now = new Date().toISOString();
    let id = existing?.id;
    if (!id) {
      const { data, error } = await supabase
        .from('speaker_badges')
        .insert({
          edition,
          speaker_name: name,
          name_key: nameKey,
          emails,
          download_token: randomBytes(32).toString('base64url'),
          created_by_email: 'import-script',
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      id = data.id;
    }

    const badgePath = `${edition}/${id}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(badgePath, buffer, {
        contentType,
        upsert: true,
        cacheControl: '60',
      });
    if (uploadError) throw new Error(uploadError.message);

    const { error: updateError } = await supabase
      .from('speaker_badges')
      .update({
        emails,
        badge_path: badgePath,
        badge_content_type: contentType,
        badge_sha256: createHash('sha256').update(buffer).digest('hex'),
        badge_updated_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .neq('status', 'sending');
    if (updateError) throw new Error(updateError.message);
    counts[existing ? 'updated' : 'created'] += 1;
  } catch (error) {
    counts.failed += 1;
    console.error(`FAILED  ${file}: ${error.message}`);
  }
}

const unmatched = [...emailsByKey.keys()].filter(
  (key) =>
    !files.some(
      (file) => buildSpeakerNameKey(speakerNameFromFilename(file)) === key
    )
);
console.log(
  `\n${apply ? 'Done' : 'Would do'}: ${counts.created} new, ${counts.updated} updated, ${counts.withEmail} with email, ${counts.failed} failed.`
);
if (unmatched.length) {
  console.log(
    `Sheet rows with no matching badge file: ${unmatched.join(', ')}`
  );
}
if (!apply) console.log('Nothing was written. Re-run with --apply to import.');
