const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

test('speakers curation reflects removals, VIP list, and Prakshi Saha normalization', async () => {
  const directoryPath = path.join(
    process.cwd(),
    'src',
    'components',
    'speakers',
    'directory.jsx'
  );
  const directorySource = fs.readFileSync(directoryPath, 'utf8');

  const vipSetMatch = directorySource.match(
    /const VIP_SPEAKERS = new Set\(\[([\s\S]*?)\]\);/
  );
  assert.ok(vipSetMatch, 'Expected VIP speaker set to exist');
  const vipSetSource = vipSetMatch[1];

  assert.doesNotMatch(vipSetSource, /'Abhishek Singh'/);
  assert.doesNotMatch(vipSetSource, /'Shri Ashwini Vaishnaw'/);
  assert.doesNotMatch(vipSetSource, /'Smt\. Annapurna Devi'/);

  const dataModuleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/data/speakers.js')
  ).href;
  const { speakers } = await import(dataModuleUrl);

  const names = new Set(speakers.map((speaker) => speaker.name));
  assert.ok(!names.has('Shri Ashwini Vaishnaw'));
  assert.ok(!names.has('Smt. Annapurna Devi'));

  const prakshi = speakers.find(
    (speaker) => speaker.photo === 'Prakshi Saha.jpg'
  );
  assert.ok(prakshi, 'Expected Prakshi Saha profile to exist');
  assert.equal(prakshi.name, 'Prakshi Saha');
  assert.equal(prakshi.designation, 'Founder, Frida Health');

  assert.equal(
    speakers.find((speaker) => speaker.name === 'Seema Jindal')?.category,
    'Technology'
  );
  assert.equal(
    speakers.find((speaker) => speaker.name === 'Karuna Nain')?.category,
    'Civil Society'
  );
  assert.equal(
    speakers.find(
      (speaker) => speaker.name === 'Jean-Christophe (J-C) Le Toquin'
    )?.category,
    'International'
  );
});
