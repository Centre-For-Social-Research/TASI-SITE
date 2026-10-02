import { partners } from './partners.js';

// TASI 2026 partners, in sponsorship order (highest first), then partners
// without a sponsorship amount. Only the order is published; amounts and
// tiers stay internal. Netflix joins once its logo is supplied.
export const tasi2026PartnerSlugs = [
  'google',
  'teleperformance',
  'meta',
  'snapchat',
  'booking-com',
  'obhan-mason',
  'tencent',
  'microsoft',
  'roblox',
  'girl-effect',
  'embassy-of-france-in-india',
  'germany-in-india',
  'netherlands-in-india',
  'match-group',
  'tech-coalition',
  'igpp',
  'asci',
  'acts-india',
  'the-dialogue',
  'the-quantum-hub',
  'grosafe',
  'frida-fund',
];

const bySlug = new Map(partners.map((partner) => [partner.slug, partner]));

export const tasi2026Partners = tasi2026PartnerSlugs.map((slug) => {
  const partner = bySlug.get(slug);
  if (!partner) throw new Error(`TASI 2026 partner not found: ${slug}`);
  return partner;
});
