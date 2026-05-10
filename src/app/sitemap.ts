import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/blog';
import { partners } from '@/data/partners';
import { speakers } from '@/data/speakers';
import { programmeSessions2025 } from '@/data/programme-2025';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';

const BASE = 'https://trustandsafetyindia.org';
const {
  getProgrammeSessionPath,
  shouldShowProgrammeSession,
  sortProgrammeSessionsForAgenda,
} = programmeAgendaUtils;
const { buildSpeakerSlug } = speakerDirectoryUtils;

type Route = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

const staticRoutes: Route[] = [
  // ── Core ────────────────────────────────────────────────────────────────────
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  {
    path: '/trust-and-safety-india-festival',
    changeFrequency: 'weekly',
    priority: 0.95,
  },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/themes', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/speakers', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/programme', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/register', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/sponsor', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/partners', changeFrequency: 'monthly', priority: 0.7 },
  // ── Get Involved ────────────────────────────────────────────────────────────
  { path: '/get-involved', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/speaker-application', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/volunteer-application', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  // ── Media ────────────────────────────────────────────────────────────────────
  { path: '/media', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/media/press-kit', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/media/press-releases', changeFrequency: 'weekly', priority: 0.6 },
  // ── Blog ─────────────────────────────────────────────────────────────────────
  { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  // ── Plan Your Travel ─────────────────────────────────────────────────────────
  { path: '/plan-your-travel', changeFrequency: 'monthly', priority: 0.7 },
  {
    path: '/plan-your-travel/general-info',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/plan-your-travel/how-to-reach',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/plan-your-travel/visa-information',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/plan-your-travel/accommodation',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  // ── Receptions ───────────────────────────────────────────────────────────────
  { path: '/receptions', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/receptions/2025', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/receptions/2026', changeFrequency: 'monthly', priority: 0.6 },
  // ── Past editions ────────────────────────────────────────────────────────────
  { path: '/past-editions', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tasi-2025', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tasi-2026', changeFrequency: 'monthly', priority: 0.5 },
  // ── Legal ────────────────────────────────────────────────────────────────────
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookie-settings', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  // Dynamic blog post entries
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts();
    blogEntries = (
      posts as Array<{ slug: string; updatedAt?: string; publishedAt?: string }>
    ).map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.updatedAt
        ? new Date(post.updatedAt)
        : post.publishedAt
          ? new Date(post.publishedAt)
          : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // silently skip dynamic blog entries if data is unavailable
  }

  const speakerEntries: MetadataRoute.Sitemap = speakers
    .map((speaker) => buildSpeakerSlug(speaker.name))
    .filter(Boolean)
    .map((slug) => ({
      url: `${BASE}/speakers/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  const programmeSessionEntries: MetadataRoute.Sitemap =
    sortProgrammeSessionsForAgenda(
      programmeSessions2025.filter(shouldShowProgrammeSession)
    ).map((session) => ({
      url: `${BASE}${getProgrammeSessionPath(session)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  const partnerEntries: MetadataRoute.Sitemap = partners.map((partner) => ({
    url: `${BASE}/partners/${partner.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticEntries,
    ...speakerEntries,
    ...programmeSessionEntries,
    ...partnerEntries,
    ...blogEntries,
  ];
}
