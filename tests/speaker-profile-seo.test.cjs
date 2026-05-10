const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('speaker profile route exposes metadata, Person schema, and static params', () => {
  const source = readSource('src/app/speakers/[slug]/page.jsx');

  assert.match(source, /export function generateStaticParams/);
  assert.match(source, /export async function generateMetadata/);
  assert.match(source, /'@type': 'Person'/);
  assert.match(source, /performerIn/);
  assert.match(source, /BreadcrumbJsonLd/);
  assert.match(source, /Trust and Safety India Festival 2026/);
  assert.match(source, /Trust and Safety India Festival Speaker/);
});

test('sitemap includes speaker profile URLs', () => {
  const source = readSource('src/app/sitemap.ts');

  assert.match(source, /import \{ speakers \} from '@\/data\/speakers'/);
  assert.match(source, /speakerEntries/);
  assert.match(source, /programmeSessionEntries/);
  assert.match(source, /partnerEntries/);
  assert.match(source, /`\$\{BASE\}\/speakers\/\$\{slug\}`/);
});

test('speaker cards link to crawlable speaker profile pages', () => {
  const source = readSource('src/components/speakers/speaker-profile-card.jsx');

  assert.match(source, /import Link from 'next\/link'/);
  assert.match(source, /getSpeakerProfilePath/);
  assert.match(source, /Open speaker profile/);
});
