const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

test('programme speaker overrides cover Christopher Cooter, Suhel Daud, and Tripti removal', async () => {
  const programmeModuleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/data/programme-2025.js')
  ).href;
  const { programmeSessions2025 } = await import(programmeModuleUrl);

  const allSpeakers = programmeSessions2025.flatMap(
    (session) => session.speakers || []
  );
  assert.ok(allSpeakers.includes('High Commissioner of Canada to India'));
  assert.ok(allSpeakers.includes('Legal Attache Suhel Daud'));
  assert.ok(!allSpeakers.includes('Ms. Tripti Gurha'));

  const programmePageSource = fs.readFileSync(
    path.join(process.cwd(), 'src/app/programme/page.jsx'),
    'utf8'
  );

  assert.match(
    programmePageSource,
    /'high commissioner of canada to india':\s*'\/img\/Speaker Highlights\/Christopher Cooter\.png'/
  );
  assert.match(
    programmePageSource,
    /'legal attache suhel daud':\s*'\/img\/speakers\/Suhel Daud\.jpg'/
  );
});

test('programme Add to Calendar button targets Microsoft Calendar', () => {
  const agendaClientSource = fs.readFileSync(
    path.join(
      process.cwd(),
      'src/components/programme/programme-agenda-client.jsx'
    ),
    'utf8'
  );

  assert.match(
    agendaClientSource,
    /<a[\s\S]*?href=\{session\.calendar\.microsoftHref\}[\s\S]*?<span>Add to Calendar<\/span>/
  );
  assert.match(agendaClientSource, /<span>Google Calendar<\/span>/);
  assert.doesNotMatch(
    agendaClientSource,
    /download=\{session\.calendar\.downloadName\}/
  );
});
