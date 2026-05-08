const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('speakers directory supports absolute image paths for homepage-only speakers', () => {
  const filePath = path.join(
    process.cwd(),
    'src',
    'lib',
    'speaker-directory-utils.cjs'
  );
  const source = fs.readFileSync(filePath, 'utf8');

  assert.match(
    source,
    /speaker\.photo\.startsWith\('\/'\)\s*\?\s*speaker\.photo/,
    'Expected speaker photo paths to support absolute homepage highlight image URLs'
  );
});

test('speakers directory delegates card rendering and icons to tracked components', () => {
  const directorySource = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'speakers', 'directory.jsx'),
    'utf8'
  );
  const profileCardSource = fs.readFileSync(
    path.join(
      process.cwd(),
      'src',
      'components',
      'speakers',
      'speaker-profile-card.jsx'
    ),
    'utf8'
  );

  assert.match(directorySource, /import \{ Search, X \} from 'lucide-react'/);
  assert.match(
    directorySource,
    /import SpeakerProfileCard from '\.\/speaker-profile-card'/
  );
  assert.doesNotMatch(directorySource, /const SpeakerProfileCard =/);
  assert.doesNotMatch(directorySource, /<svg/);
  assert.match(profileCardSource, /getSpeakerPhotoSrc/);
  assert.match(profileCardSource, /getSpeakerLinkedInUrl/);
});
