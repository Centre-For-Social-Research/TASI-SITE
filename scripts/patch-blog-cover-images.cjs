/**
 * Patches the coverImageUrl field on all migrated blog posts in Sanity.
 * Run from the project root:
 *   node scripts/patch-blog-cover-images.cjs
 */
const { createClient } = require('next-sanity');
const fs = require('fs');

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/\r$/, '');
});

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const imageMap = {
  'tasi-2026-stakeholder-roundtable':           '/img/home-gallery/7T7A5237-new.webp',
  'call-for-proposals-open':                    '/img/home-gallery/tasi-2026-brochure-3.png',
  'early-bird-registration':                    '/img/home-gallery/7T7A0181.webp',
  'tasi-2026-dates-announced':                  '/img/home-gallery/7T7A0646.webp',
  'tasi-community-mixer':                       '/img/home-gallery/tasi-community-mixer.webp',
  'human-centered-solutions-social-media-harms': '/img/home-gallery/dr-ranjana-kumari.jpg',
  'tackling-harms-of-non-consensual-intimate-images': '/img/home-gallery/non-consensual-intimate-images-article.png',
};

async function patchImages() {
  const posts = await client.fetch('*[_type == "post"]{_id, "slug": slug.current}');
  console.log(`Found ${posts.length} posts to patch.\n`);

  for (const post of posts) {
    const imgUrl = imageMap[post.slug];
    if (!imgUrl) {
      console.log(`  SKIP  ${post.slug} — no image mapping`);
      continue;
    }
    await client.patch(post._id).set({ coverImageUrl: imgUrl }).commit();
    console.log(`  PATCH ${post.slug} → ${imgUrl}`);
  }
  console.log('\nDone.');
}

patchImages().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
