import { partners } from './partners.js';
import { tasi2026Partners, tasi2026SessionPartners } from './partners-2026.js';
import { tasi2025Partners } from './tasi-2025-edition.js';

export const partnersPageMetadata = {
  title: 'Trust and Safety India Festival Partners | TASI Organizations',
  description:
    'Meet Trust and Safety India Festival partners, sponsors, platforms, civil society organizations, diplomatic missions, research groups, and ecosystem collaborators.',
  alternates: {
    canonical: '/partners',
  },
  openGraph: {
    title: 'Trust and Safety India Festival Partners | TASI Organizations',
    description:
      'Organizations and partners supporting TASI across trust and safety, online safety, platform governance, and AI accountability.',
    url: '/partners',
    type: 'website',
    images: ['/opengraph-image'],
  },
};

// The page switches between editions, like the speakers and receptions
// pages; the eyebrow stays fixed and the heading follows the year.
export const partnersPageHero = {
  eyebrow: 'Our Partners',
  title: 'Our Partners',
  editions: {
    2026: {
      title: 'Partners of TASI 2026',
      description:
        'The technology companies, civil society organisations, diplomatic missions, and research institutions partnering with us to shape the trust and safety conversation at TASI 2026.',
      updateNote:
        'This list will be updated as additional partners are confirmed.',
    },
    2025: {
      title: 'Partners of TASI 2025',
      description:
        'A diverse network of technology companies, civil society organisations, diplomatic missions, and research institutions that shaped the trust and safety conversation at TASI 2025.',
    },
  },
};

export const PARTNER_EDITIONS = ['2025', '2026'];
export const DEFAULT_PARTNER_EDITION = '2026';

const partnersBySlug = new Map(
  partners.map((partner) => [partner.slug, partner])
);

// 2026 in sponsorship order; 2025 as it was, with that year's names and
// logos, and each partner's current category for the card.
export function getPartnersForEdition(edition) {
  if (edition === '2025') {
    return tasi2025Partners.map((partner) => ({
      ...partner,
      category: partnersBySlug.get(partner.slug)?.category || '',
    }));
  }
  return tasi2026Partners;
}

// Workshop, roundtable and session partners get their own section below the
// main grid. Only 2026 has them.
export const partnersPageSessionSection = {
  title: 'Session Partners',
  description:
    'Organisations hosting workshops, roundtables and sessions at TASI 2026.',
};

export function getSessionPartnersForEdition(edition) {
  return edition === '2026' ? tasi2026SessionPartners : [];
}

export const partnersPageCta = {
  eyebrow: 'Partner With TASI 2026',
  title: 'Join the network',
  description:
    "Interested in partnering with TASI 2026? Explore sponsorship opportunities and partnership formats aligned to your organisation's goals.",
  primary: {
    href: '/sponsor',
    label: 'View Partnership Opportunities',
  },
  secondary: {
    href: '/contact',
    label: 'Get in Touch',
  },
};

export const partnerSocialConfig = {
  linkedin: {
    label: 'LinkedIn',
    color:
      'border-[#0077b5]/30 bg-[#0077b5]/8 text-[#0077b5] hover:bg-[#0077b5]/15 hover:border-[#0077b5]/60',
  },
  instagram: {
    label: 'Instagram',
    color:
      'border-[#e1306c]/30 bg-[#e1306c]/8 text-[#e1306c] hover:bg-[#e1306c]/15 hover:border-[#e1306c]/60',
  },
  twitter: {
    label: 'X (Twitter)',
    color:
      'border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200 hover:border-stone-500',
  },
  youtube: {
    label: 'YouTube',
    color:
      'border-[#ff0000]/30 bg-[#ff0000]/8 text-[#ff0000] hover:bg-[#ff0000]/15 hover:border-[#ff0000]/60',
  },
};

export function getPartnerStaticParams() {
  return partners.map((partner) => ({ slug: partner.slug }));
}

export function getPartnerBySlug(slug) {
  return partners.find((partner) => partner.slug === slug);
}

export function getPartnerMetadata(slug) {
  const partner = getPartnerBySlug(slug);
  if (!partner) return {};
  const title = `${partner.name} | Trust and Safety India Festival Partner`;
  const description = `${partner.description} ${partner.name} is listed as a ${partner.type} for Trust and Safety India Festival.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/partners/${partner.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/partners/${partner.slug}`,
      type: 'profile',
      images: partner.logo ? [partner.logo] : ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: partner.logo ? [partner.logo] : ['/twitter-image'],
    },
  };
}

export function getPartnerNavigation(currentSlug) {
  const currentIndex = partners.findIndex(
    (partner) => partner.slug === currentSlug
  );

  return {
    previous: currentIndex > 0 ? partners[currentIndex - 1] : null,
    next:
      currentIndex >= 0 && currentIndex < partners.length - 1
        ? partners[currentIndex + 1]
        : null,
  };
}

export function buildPartnerSocialLinks(partner) {
  return Object.entries(partner.social || {})
    .map(([network, href]) => {
      const config = partnerSocialConfig[network];
      if (!config || !href) return null;

      return {
        network,
        href,
        ...config,
      };
    })
    .filter(Boolean);
}
