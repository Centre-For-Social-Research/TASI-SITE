/**
 * One-time migration: copies posts from src/data/blog-posts.js into Sanity.
 * Run from the project root:
 *   node scripts/migrate-blog-to-sanity.mjs
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env.local manually (no dotenv dep required) ────────────────────────
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/\r$/, '');
    env[key] = val;
  }
  return env;
}

const envPath = path.resolve(__dirname, '../.env.local');
const env = loadEnv(envPath);

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset   = env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token     = env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse "Mar 25, 2026" → ISO string */
function parseDate(dateStr) {
  return new Date(dateStr).toISOString();
}

/** Simple unique key generator */
let _keyCounter = 0;
function key() {
  return `k${Date.now()}${(_keyCounter++).toString(36)}`;
}

/**
 * Convert plain text (paragraphs separated by \n\n) into Portable Text blocks.
 * Each paragraph becomes a 'block' with a single 'span' child.
 */
function textToPortableText(text) {
  if (!text) return [];
  return text
    .split(/\n\n+/)
    .map(para => para.trim())
    .filter(Boolean)
    .map(para => ({
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key(), marks: [], text: para }],
    }));
}

// ── Blog posts data ───────────────────────────────────────────────────────────

const posts = [
  {
    slug: 'tasi-2026-stakeholder-roundtable',
    title: 'TASI 2026 Stakeholder Engagement Roundtable',
    excerpt:
      "Join us as we kick off the preparation for TASI 2026 with an online stakeholder engagement roundtable to map our upcoming focus: 'People First. Safety Always.'",
    date: 'Mar 25, 2026',
    author: 'TASI Team',
    category: 'ANNOUNCEMENT',
    content:
      'The Trust & Safety Festival and Centre for Social Research India are pleased to announce an upcoming online Stakeholder Engagement Roundtable to begin preparations for TASI 2026.\n\nBringing together key partners and participants from TASI 2025, this roundtable will serve as an important starting point in shaping the vision, priorities, and direction of the next edition. As we look ahead, TASI 2026 will centre its conversations around people, guided by the theme and tagline: "People First. Safety Always."\n\nThe roundtable is being planned as a space for reflection, consultation, and collaboration. It will help ensure that the programme for 2026 is informed by the expertise and insights of the trust and safety community, while also strengthening stakeholder ownership in the journey ahead. It will further reinforce TASI\'s commitment to being a platform rooted in India with a global outlook and ambition.\n\nA key focus of the discussion will also be on building stronger pathways for participation from the Global South, including exploring the support needed to make representation broader and more meaningful in the coming year.\n\nThe meeting is expected to be held online for no more than one hour, either between 7 and 11 April 2026 or after 20 April 2026. The proposed agenda includes an introduction by the Trust & Safety Festival and Centre for Social Research India, followed by discussions on key themes for TASI 2026, preferred session formats, stakeholder representation across sectors, and the timeline for sponsorship and session submissions.\n\nAs preparations begin, this roundtable marks the first step towards building a more inclusive, engaged, and forward-looking TASI 2026.',
  },
  {
    slug: 'call-for-proposals-open',
    title: 'Call for Proposals Now Open',
    excerpt:
      "Submit your proposals for sessions, panels, and workshops for TASI 2026. Join us in shaping the agenda for India's foremost trust and safety convening.",
    date: 'Feb 15, 2026',
    author: 'TASI Team',
    category: 'ANNOUNCEMENT',
    content:
      "Submit your proposals for sessions, panels, and workshops for TASI 2026. Join us in shaping the agenda for India's foremost trust and safety convening. We are looking for thought leaders, researchers, and practitioners to contribute to our diverse programming.",
  },
  {
    slug: 'early-bird-registration',
    title: 'Early Bird Registration',
    excerpt:
      'Secure your spot at TASI 2026 with our early bird rates. Don\'t miss out on the opportunity to connect with industry leaders.',
    date: 'Mar 01, 2026',
    author: 'TASI Team',
    category: 'REGISTRATION',
    content:
      'Secure your spot at TASI 2026 with our early bird rates. Don\'t miss out on the opportunity to connect with industry leaders, policymakers, and civil society experts. Early bird registration closes on March 31st, 2026.',
  },
  {
    slug: 'tasi-2026-dates-announced',
    title: 'Dates for TASI 2026 Announced',
    excerpt:
      "The 2nd edition of India's leading summit on Trust, Safety and AI Governance will take place on 13-14 October 2026 in New Delhi.",
    date: 'Mar 15, 2026',
    author: 'TASI Team',
    category: 'ANNOUNCEMENT',
    content:
      "The 2nd edition of India's leading summit on Trust, Safety and AI Governance will take place on 13-14 October 2026 in New Delhi.",
  },
  {
    slug: 'tasi-community-mixer',
    title: 'TASI Community Mixer',
    excerpt:
      'Join our pre-conference virtual networking event to meet fellow attendees and discuss pressing trust and safety issues.',
    date: 'Apr 05, 2026',
    author: 'TASI Team',
    category: 'COMMUNITY',
    content:
      'Join our pre-conference virtual networking event to meet fellow attendees and discuss pressing trust and safety issues. This is a great opportunity to build connections and explore collaboration opportunities.',
  },
  {
    slug: 'human-centered-solutions-social-media-harms',
    title: 'Human-Centered Solutions Are Key To Fixing Social Media Harms',
    excerpt:
      'Dr. Ranjana Kumari argues for people-first platform design, stronger accountability, and practical safeguards that reduce harms without leaving users to navigate risk alone.',
    date: 'Dec 19, 2025',
    author: 'Dr. Ranjana Kumari',
    category: 'COMMENTARY',
    content:
      'Dr. Ranjana Kumari calls for human-centered policy, platform accountability, and stronger support systems that respond to the lived realities of people facing harm online.',
    sourceUrl:
      'https://news.abplive.com/infotainment/human-centered-solutions-are-key-to-fixing-social-media-harms-1817659',
  },
  {
    slug: 'tackling-harms-of-non-consensual-intimate-images',
    title: 'Tackling the harms of non-consensual intimate images',
    excerpt:
      'Dr. Ranjana Kumari examines image-based abuse, survivor-centered responses, and the urgent need for stronger systems to prevent and remedy digital exploitation.',
    date: 'Oct 18, 2025',
    author: 'Dr. Ranjana Kumari',
    category: 'COMMENTARY',
    content:
      'Dr. Ranjana Kumari writes about image-based abuse, the lasting impact of non-consensual intimate image sharing, and why policy, platforms, and institutions must respond with survivor-centered safeguards.',
    sourceUrl:
      'https://www.hindustantimes.com/ht-insight/governance/tackling-the-harms-of-non-consensual-intimate-images-101760777390725.html',
  },
];

// ── Migration ─────────────────────────────────────────────────────────────────

async function migrate() {
  console.log(`Connecting to Sanity project "${projectId}" / dataset "${dataset}"...\n`);

  let created = 0;
  let skipped = 0;

  for (const post of posts) {
    // Check for duplicate by slug
    const existing = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]._id`,
      { slug: post.slug }
    );

    if (existing) {
      console.log(`  SKIP  "${post.title}" — already exists (${existing})`);
      skipped++;
      continue;
    }

    const doc = {
      _type: 'post',
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      excerpt: post.excerpt,
      publishedAt: parseDate(post.date),
      author: post.author,
      category: post.category,
      ...(post.sourceUrl ? { sourceUrl: post.sourceUrl } : {}),
      body: textToPortableText(post.content),
    };

    const result = await client.create(doc);
    console.log(`  CREATE "${post.title}" → ${result._id}`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped (already exist): ${skipped}`);
  if (created > 0) {
    console.log('\nPosts are saved as drafts. Open Sanity Studio (/studio) to publish them,');
    console.log('or run: node scripts/publish-blog-posts.mjs');
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
