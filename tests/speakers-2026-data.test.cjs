const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const speakers = require('../src/data/speakers-2026.json');
const { buildSpeakerSlug } = require('../src/lib/speaker-directory-utils.cjs');

test('2026 speaker snapshot has complete public profiles and matched images', () => {
  assert.equal(speakers.length, 47);
  const slugs = new Set();
  for (const speaker of speakers) {
    for (const field of [
      'name',
      'designation',
      'organisation',
      'country',
      'category',
      'bio',
    ]) {
      assert.ok(speaker[field], `${speaker.name}: ${field} is missing`);
    }
    assert.equal(speaker.edition, '2026');
    assert.equal(speaker.quote, undefined);
    const slug = buildSpeakerSlug(speaker.name);
    assert.ok(!slugs.has(slug), `Duplicate slug: ${slug}`);
    slugs.add(slug);
    assert.ok(speaker.photo, `${speaker.name}: headshot is missing`);
    assert.ok(
      fs.existsSync(path.join(process.cwd(), 'public', speaker.photo)),
      `${speaker.name}: headshot file is missing`
    );
    for (const field of ['linkedinUrl', 'xUrl', 'instagramUrl']) {
      if (speaker[field]) assert.match(speaker[field], /^https:\/\//);
    }
  }
});
