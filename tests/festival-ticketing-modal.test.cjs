const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

function readFile(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

test('festival ticketing uses a modal wizard for details review and payment', () => {
  const source = readFile(
    'src/components/register/festival-ticketing-section.jsx'
  );

  assert.match(source, /Event Registration/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /Details/);
  assert.match(source, /Review/);
  assert.match(source, /Payment/);
  assert.match(source, /Order Summary/);
  assert.match(source, /Initialising Secure Payment/);
});

test('festival ticketing no longer renders the inline purchase panel shell', () => {
  const source = readFile(
    'src/components/register/festival-ticketing-section.jsx'
  );

  assert.doesNotMatch(
    source,
    /selectedCard \? \(\s*<div className="mt-12 rounded-\[10px\] border border-slate-200 bg-white p-6 shadow-\[0_24px_80px_rgba\(15,23,42,0\.08\)\] dark:border-slate-800 dark:bg-slate-900 md:p-8">/
  );
});

test('festival ticketing validates details before advancing to review or payment', () => {
  const source = readFile(
    'src/components/register/festival-ticketing-section.jsx'
  );

  assert.match(source, /festivalCreateOrderSchema\.safeParse\(form\)/);
  assert.match(source, /onClick=\{goToReviewStep\}/);
  assert.match(source, /Please complete the required registration details\./);
});
