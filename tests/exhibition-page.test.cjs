const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('exhibition page route uses the new flagship pavilion sales story', () => {
  const routePath = path.join(
    process.cwd(),
    'src',
    'app',
    'exhibition',
    'page.jsx'
  );

  assert.ok(fs.existsSync(routePath), 'Expected exhibition route to exist.');

  const source = readFile('src/app/exhibition/page.jsx');

  assert.match(source, /import BrandedPageHero from ['"]@\/components\/ui\/branded-page-hero['"]/);
  assert.match(source, /import GlobalCta from ['"]@\/components\/home\/global-cta['"]/);
  assert.match(source, /<BrandedPageHero/);
  assert.match(source, /Participation & Exhibition/);
  assert.match(source, /Flagship Pavilion/);
  assert.match(
    source,
    /A premium space for organisations shaping[\s\S]*digital trust/
  );
  assert.match(source, /Send an Enquiry/);
  assert.match(source, /Participation Modes/);
  assert.match(source, /Branding Opportunities/);
  assert.match(source, /Festival-wide branding opportunities/);
  assert.match(source, /Visibility feels more valuable when the room is already relevant\./);
  assert.match(
    source,
    /Looking beyond the booth to the broader potential of TASI 2026/
  );
  assert.match(source, /GlobalCta/);
  assert.match(source, /bg-gradient-to-br from-\[#5c0f4f\] via-\[#360454\] to-\[#15002b\]/);
  assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.09 PM\.jpeg/);
  assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.16 PM\.jpeg/);
  assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.17 PM\.jpeg/);
  assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.18 PM\.jpeg/);
});

test('extended branding cards include custom image framing treatments', () => {
  const source = readFile('src/app/exhibition/page.jsx');

  assert.match(
    source,
    /title:\s*'Event Collateral & Programs'[\s\S]*imageClassName:\s*'object-contain rotate-\[-90deg\] scale-\[0\.9\]'/
  );
  assert.match(
    source,
    /title:\s*'Venue Signage & Welcome Boards'[\s\S]*imageClassName:\s*'object-cover object-center'/
  );
  assert.match(
    source,
    /title:\s*'Delegate Badges & Lanyards'[\s\S]*cardClassName:\s*'bg-white ring-1 ring-stone-200 shadow-lg shadow-stone-200\/40 dark:bg-stone-950 dark:ring-stone-700'/
  );
  assert.match(
    source,
    /className=\{`object-cover transition-transform duration-500 group-hover:scale-105 \$\{item\.imageClassName \?\? ''\}`\}/
  );
  assert.match(
    source,
    /className=\{`group relative flex flex-col rounded-\[10px\] border border-gray-200 bg-gray-50 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900\/50 overflow-hidden \$\{item\.cardClassName \?\? ''\}`\}/
  );
});
