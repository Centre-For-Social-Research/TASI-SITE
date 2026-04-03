const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

test("register page renders festival ticketing below the approval-based registration flow", () => {
  const source = readFile("src/app/register/page.jsx");
  const registrationFormIndex = source.indexOf("<RegistrationForm />");
  const festivalSectionIndex = source.indexOf("<FestivalTicketingSection />");

  assert.notEqual(registrationFormIndex, -1);
  assert.notEqual(festivalSectionIndex, -1);
  assert.ok(
    festivalSectionIndex > registrationFormIndex,
    "Festival ticketing section should appear after the approval-based registration block.",
  );
});

test("festival ticketing cards use the legacy footer label", () => {
  const source = readFile("src/components/register/festival-ticketing-section.jsx");

  assert.match(source, /absolute bottom-5 left-6/);
  assert.match(source, /TASI 2026/);
});

test("festival ticketing cards use the redesigned centered ticket layout", () => {
  const source = readFile("src/components/register/festival-ticketing-section.jsx");

  assert.match(source, /Choose your ticket/);
  assert.match(source, /Register now/);
  assert.match(source, /top-1\/2/);
});

test("festival ticketing modal stays hidden until a card is selected", () => {
  const source = readFile("src/components/register/festival-ticketing-section.jsx");

  assert.match(
    source,
    /const \[ticketModalOpen, setTicketModalOpen\] = useState\(false\)/,
  );
  assert.match(source, /ticketModalOpen \? \(/);
});

test("festival ticketing cards are not wrapped in a white boxed container", () => {
  const source = readFile("src/components/register/festival-ticketing-section.jsx");

  assert.doesNotMatch(
    source,
    /<div className="rounded-\[10px\] border border-slate-200 bg-white p-6 shadow-\[0_24px_80px_rgba\(15,23,42,0\.08\)\] dark:border-slate-800 dark:bg-slate-900 md:p-8">/,
  );
});

test("festival ticketing includes a RightsCon-style what's included section", () => {
  const source = readFile("src/components/register/festival-ticketing-section.jsx");

  assert.match(source, /What&apos;s included in your ticket/);
  assert.match(source, /2 days of conference programming and 3 receptions/);
  assert.match(source, /Domestic Pass/);
  assert.match(source, /International Pass/);
});
