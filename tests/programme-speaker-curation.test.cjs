const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

test('programme data reflects speaker/session curation requests', async () => {
  const programmeModuleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/data/programme-2025.js')
  ).href;
  const { programmeSessions2025 } = await import(programmeModuleUrl);

  const allSpeakers = programmeSessions2025.flatMap(
    (session) => session.speakers || []
  );

  assert.ok(allSpeakers.includes('Dr. Ranjana Kumari'));
  assert.ok(!allSpeakers.includes('Ranjana Kumari, PhD'));
  assert.ok(!allSpeakers.includes('Shri Ashwini Vaishnaw'));
  assert.ok(!allSpeakers.includes('Smt. Annapurna Devi'));

  const programmePageDataSource = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/programme-page-data.js'),
    'utf8'
  );

  assert.match(
    programmePageDataSource,
    /'delphine o':\s*'\/img\/speakers\/Delphine O\.jpg'/
  );
  assert.match(
    programmePageDataSource,
    /'julie inman grant':\s*'\/img\/speakers\/Julie_Inman_Grant\.jpg'/
  );
});
