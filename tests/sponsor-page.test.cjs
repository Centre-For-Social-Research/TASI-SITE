const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function absolutePath(relativePath) {
  return path.join(process.cwd(), relativePath);
}

function readFile(relativePath) {
  return fs.readFileSync(absolutePath(relativePath), 'utf8');
}

async function importModule(relativePath) {
  return import(pathToFileURL(absolutePath(relativePath)));
}

test('sponsor route delegates to the tracked sponsor page component', () => {
  const source = readFile('src/app/sponsor/page.jsx');

  assert.match(
    source,
    /import SponsorPage from ['"]@\/components\/sponsor\/sponsor-page['"]/
  );
  assert.match(source, /return <SponsorPage \/>;/);
  assert.doesNotMatch(source, /sponsorMetrics/);
  assert.doesNotMatch(source, /PricingSection/);
  assert.doesNotMatch(source, /PartnersMarqueeStrip/);
});

test('sponsor page shell composes sections from shared data', () => {
  const source = readFile('src/components/sponsor/sponsor-page.jsx');

  assert.match(source, /sponsorHero/);
  assert.match(source, /SponsorStorySection/);
  assert.match(source, /SponsorAdvantagesSection/);
  assert.match(source, /SponsorshipTiersSection/);
  assert.match(source, /SponsorPartnerOptionsSection/);
  assert.match(source, /PartnersMarqueeStrip/);
  assert.doesNotMatch(source, /const sponsorMetrics = \[/);
  assert.doesNotMatch(source, /const tiers = \[/);
  assert.doesNotMatch(source, /const partnerOptions = \[/);
});

test('sponsor page data exposes only the live sponsorship datasets', async () => {
  const data = await importModule('src/data/sponsor-page.js');

  assert.equal(data.sponsorMetrics.length, 3);
  assert.equal(data.sponsorReasons.length, 4);
  assert.equal(data.sponsorshipPillars.length, 3);
  assert.equal(data.sponsorPricingPlans.length, 5);
  assert.equal(data.sponsorPartnerOptions.length, 2);
  assert.equal(data.sponsorHero.title, 'Sponsorship Opportunities');
  assert.deepEqual(
    data.sponsorPricingPlans.slice(0, 4).map((plan) => plan.name),
    ['Platinum', 'Gold', 'Silver', 'Supporter']
  );
  assert.equal(
    data.sponsorPricingPlans.every((plan) => Array.isArray(plan.features)),
    true
  );
  assert.equal(
    data.sponsorPartnerOptions.some((option) => option.email),
    true
  );
});

test('sponsor sections render the expected page flow and pricing integration', () => {
  const source = readFile('src/components/sponsor/sponsor-sections.jsx');

  assert.match(source, /Why Sponsor TASI/);
  assert.match(source, /What sponsors get/);
  assert.match(source, /Sponsor Advantages/);
  assert.match(source, /sponsorship-tiers/);
  assert.match(source, /partner-options/);
  assert.match(source, /PricingSection/);
  assert.match(source, /sponsorPricingPlans/);
  assert.match(source, /sponsorshipProspectus/);
  assert.match(source, /sponsorPartnerOptions/);
  assert.match(
    source,
    /SponsorStorySection[\s\S]*SponsorAdvantagesSection[\s\S]*SponsorshipTiersSection[\s\S]*SponsorPartnerOptionsSection/
  );
  assert.doesNotMatch(source, /const pricingPlans = \[/);
  assert.doesNotMatch(source, /const partnerOptions = \[/);
});
