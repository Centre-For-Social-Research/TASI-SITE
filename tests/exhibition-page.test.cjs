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

  assert.match(
    source,
    /import BrandedPageHero from ['"]@\/components\/ui\/branded-page-hero['"]/
  );
  assert.match(
    source,
    /import GlobalCta from ['"]@\/components\/home\/global-cta['"]/
  );
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
  assert.match(
    source,
    /Visibility feels more valuable when the room is already[\s\S]*relevant\./
  );
  assert.match(
    source,
    /Looking beyond the booth to the broader potential of TASI 2026/
  );
  assert.match(source, /GlobalCta/);
  assert.match(
    source,
    /import ExhibitionEnquiryForm from ['"]@\/components\/exhibition\/exhibition-enquiry-form['"]/
  );
  assert.match(source, /<ExhibitionEnquiryForm \/>/);
  assert.match(source, /Exhibition Enquiry/);
  assert.match(
    source,
    /Start the conversation around a presence that belongs in the[\s\S]*room\./
  );
  assert.doesNotMatch(source, /Editorial Note/);
  assert.doesNotMatch(source, /Built for aligned organisations/);
  assert.doesNotMatch(source, /Shaped around the right format/);
  assert.doesNotMatch(source, /Follow-up with context/);
  assert.match(source, /Prefer to reach out directly\? Write to/);
  assert.match(
    source,
    /bg-gradient-to-br from-\[#5c0f4f\] via-\[#360454\] to-\[#15002b\]/
  );
  assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.09 PM\.webp/);
  assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.16 PM\.webp/);
  assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.17 PM\.webp/);
  assert.match(source, /WhatsApp Image 2026-04-14 at 8\.17\.18 PM\.webp/);
});

test('extended branding cards include custom image framing treatments', () => {
  const source = readFile('src/app/exhibition/page.jsx');

  assert.match(
    source,
    /title:\s*'Speaker & Delegate Kits'[\s\S]*imageClassName:\s*'object-cover'/
  );
  assert.match(
    source,
    /title:\s*'Venue Signage & Welcome Boards'[\s\S]*imageClassName:\s*'object-cover object-center'/
  );
  assert.match(
    source,
    /title:\s*'Digital Standees & Kiosks'[\s\S]*imageClassName:\s*'object-cover object-center'/
  );
  assert.match(
    source,
    /className=\{`object-cover transition-transform duration-500 group-hover:scale-105 \$\{item\.imageClassName \?\? ''\}`\}/
  );
  assert.match(
    source,
    /className=\{`group relative flex flex-col[\s\S]*overflow-hidden[\s\S]*\$\{item\.cardClassName \?\? ''\}`\}/
  );
});

test('exhibition enquiry form posts basic details through the shared messages pipeline', () => {
  const componentPath = path.join(
    process.cwd(),
    'src',
    'components',
    'exhibition',
    'exhibition-enquiry-form.jsx'
  );

  assert.ok(
    fs.existsSync(componentPath),
    'Expected exhibition enquiry form component to exist.'
  );

  const source = readFile(
    'src/components/exhibition/exhibition-enquiry-form.jsx'
  );

  assert.match(source, /fetch\('\/api\/messages'/);
  assert.match(source, /name="name"/);
  assert.match(source, /name="company"/);
  assert.match(source, /name="email"/);
  assert.match(source, /name="phone"/);
  assert.match(source, /name="message"/);
  assert.match(source, /source:\s*'exhibition-enquiry'/);
  assert.match(source, /Exhibition enquiry for TASI 2026/);
  assert.match(source, /We received your enquiry\./);
});

test('shared messages route uses stricter abuse protection and source metadata for known callers', () => {
  const routeSource = readFile('src/app/api/messages/route.js');
  const footerSource = readFile('src/components/ui/footer-section.tsx');

  assert.match(routeSource, /protectPublicPostRoute\(request, 'messages', \{/);
  assert.match(routeSource, /windowMs:\s*15\s*\*\s*60\s*\*\s*1000/);
  assert.match(routeSource, /maxRequests:\s*3/);
  assert.match(routeSource, /const source = body\?\.source/);
  assert.match(routeSource, /const normalizedSource =/);
  assert.match(routeSource, /source:\s*normalizedSource/);
  assert.match(routeSource, /`Source: \$\{normalizedSource\}`/);

  assert.match(footerSource, /fetch\('\/api\/messages'/);
  assert.match(footerSource, /source:\s*'site-footer'/);
  assert.match(
    footerSource,
    /setMessageStatus\(data\?\.error \|\| `Request failed \(\$\{response\.status\}\)\.`\)/
  );
});
