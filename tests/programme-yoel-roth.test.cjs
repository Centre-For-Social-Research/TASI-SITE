const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

test('programme uses Yoel Roth name without suffix so speaker page photo can resolve', async () => {
  const programmeModuleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/data/programme-2025.js')
  ).href;
  const speakersModuleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/data/speakers.js')
  ).href;

  const { programmeSessions2025 } = await import(programmeModuleUrl);
  const { speakers } = await import(speakersModuleUrl);

  const programmeSpeakers = programmeSessions2025.flatMap(
    (session) => session.speakers || []
  );

  assert.ok(programmeSpeakers.includes('Yoel Roth'));
  assert.ok(!programmeSpeakers.includes('Yoel Roth, PhD'));

  const yoelProfile = speakers.find((speaker) => speaker.name === 'Yoel Roth');
  assert.ok(yoelProfile, 'Expected Yoel Roth speaker profile to exist');
  assert.equal(yoelProfile.photo, 'Yoel Roth.jpg');
});
