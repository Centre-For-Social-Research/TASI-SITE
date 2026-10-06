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

// Organisations hosting a workshop, roundtable or session at TASI 2026,
// in alphabetical order. They have their own section on the partners page
// and stay out of the sponsor list above, the homepage strip and the
// sponsor page.
export const tasi2026SessionPartnerSlugs = [
  'ab-research-consulting',
  'adobe',
  'ifdc',
  'kutunga',
  'moxii-africa',
  'sflc-in',
  'tattle',
  'the-quint',
  'yuvaa',
];

const bySlug = new Map(partners.map((partner) => [partner.slug, partner]));

const resolve = (slug) => {
  const partner = bySlug.get(slug);
  if (!partner) throw new Error(`TASI 2026 partner not found: ${slug}`);
  return partner;
};

export const tasi2026Partners = tasi2026PartnerSlugs.map(resolve);

export const tasi2026SessionPartners = tasi2026SessionPartnerSlugs.map(resolve);
