import { partners } from './partners.js';

export const partnersPageMetadata = {
  title: 'Partners | TASI 2026',
  description:
    'Meet the organisations that partnered with TASI 2025 to advance trust and safety conversations in India and globally.',
};

export const partnersPageHero = {
  eyebrow: 'TASI 2025',
  title: 'Our Partners',
  description:
    'A diverse network of technology companies, civil society organisations, diplomatic missions, and research institutions that shaped the trust and safety conversation at TASI 2025.',
};

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
