const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

test('programme replaces Jyoti CSR with Jyoti Vadehra and removes Ajit Kumar', async () => {
  const programmeModuleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/data/programme-2025.js')
  ).href;
  const speakersModuleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/data/speakers.js')
  ).href;

  const { programmeSessions2025 } = await import(programmeModuleUrl);
  const { speakers } = await import(speakersModuleUrl);

  const allSpeakers = programmeSessions2025.flatMap(
    (session) => session.speakers || []
  );

  assert.ok(allSpeakers.includes('Jyoti Vadehra'));
  assert.ok(!allSpeakers.includes('Ajit Kumar'));

  const jyotiProfile = speakers.find(
    (speaker) => speaker.name === 'Jyoti Vadehra'
  );
  assert.ok(jyotiProfile, 'Expected Jyoti Vadehra speaker profile to exist');
  assert.equal(jyotiProfile.photo, 'Jyoti Vadehra.jpg');

  const welcomeBackSession = programmeSessions2025.find(
    (session) => session.id === 'tasi25-32'
  );
  assert.ok(welcomeBackSession, 'Expected welcome back session to exist');
  assert.ok(welcomeBackSession.speakers.includes('Jyoti Vadehra'));
  assert.equal(welcomeBackSession.description, 'Jyoti Vadehra');
});
