const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const repoPath = (...segments) => path.join(process.cwd(), ...segments);
const read = (...segments) => fs.readFileSync(repoPath(...segments), 'utf8');
const loadData = (relativePath) =>
  import(pathToFileURL(repoPath(...relativePath)).href);

test('blog routes delegate to tracked page components', () => {
  const indexRoute = read('src', 'app', 'blog', 'page.jsx');
  const postRoute = read('src', 'app', 'blog', '[slug]', 'page.jsx');

  assert.match(indexRoute, /metadata = blogIndexMetadata/);
  assert.match(indexRoute, /PageSeoJsonLd/);
  assert.match(indexRoute, /<BlogIndexPage \/>/);
  assert.doesNotMatch(indexRoute, /getBlogPosts/);
  assert.doesNotMatch(indexRoute, /BlogPageClient/);

  assert.match(postRoute, /BlogPostPage/);
  assert.match(postRoute, /generateMetadata/);
  assert.match(postRoute, /generateStaticParams/);
  assert.doesNotMatch(postRoute, /PortableText/);
  assert.doesNotMatch(postRoute, /ShareButtons/);
});

test('blog index components keep live content in shared data and cards', () => {
  const serverPage = read('src', 'components', 'blog', 'blog-index-page.jsx');
  const clientPage = read('src', 'components', 'blog', 'blog-page-client.jsx');
  const card = read('src', 'components', 'blog', 'blog-post-card.jsx');

  assert.match(serverPage, /getBlogPosts/);
  assert.match(serverPage, /getBlogCategoryList/);
  assert.match(serverPage, /BlogPageClient/);

  assert.match(clientPage, /BlogPostCard/);
  assert.match(clientPage, /blogIndexHero/);
  assert.match(clientPage, /blogIndexCopy/);
  assert.match(clientPage, /blogIndexCta/);
  assert.doesNotMatch(clientPage, /Latest Updates & Insights/);
  assert.doesNotMatch(clientPage, /post\.content\.substring/);

  assert.match(card, /rounded-\[10px\]/);
  assert.match(card, /sourceUrl/);
});

test('blog post component owns article rendering and fallback copy', () => {
  const postPage = read('src', 'components', 'blog', 'blog-post-page.jsx');

  assert.match(postPage, /SanityBodyBlock/);
  assert.match(postPage, /ShareButtons/);
  assert.match(postPage, /blogPostFallbackCopy/);
  assert.match(postPage, /post\.content\.split/);
  assert.match(postPage, /blogPostFallbackCopy\.emptyBody/);
  assert.match(postPage, /defaultSiteUrl/);
});

test('blog data owns page metadata and copy', async () => {
  const data = await loadData(['src', 'data', 'blog-page.js']);

  assert.equal(
    data.blogIndexMetadata.title,
    'Trust and Safety India Festival News and Blogs | TASI 2026'
  );
  assert.equal(data.blogIndexHero.eyebrow, 'Blog & News');
  assert.equal(data.blogIndexCopy.allPostsLabel, 'All Posts');
  assert.equal(data.blogIndexCta.href, '/register');
  assert.equal(
    data.blogPostFallbackCopy.defaultSiteUrl,
    'https://trustandsafetyindia.org'
  );
});

test('blog fallback posts do not retain mojibake from old exports', () => {
  const blogPosts = read('src', 'data', 'blog-posts.js');

  assert.doesNotMatch(blogPosts, /\u00e2/);
  assert.match(blogPosts, /"People First\. Safety Always\."/);
  assert.match(blogPosts, /TASI\\'s commitment/);
});

test('Sanity blog fetches have a bounded timeout before local fallback', () => {
  const sanityClient = read('src', 'sanity', 'lib', 'client.js');
  const sanityQueries = read('src', 'sanity', 'lib', 'queries.js');

  assert.match(sanityClient, /@sanity\/client/);
  assert.match(sanityClient, /timeout: 8000/);
  assert.doesNotMatch(sanityQueries, /next-sanity/);
  assert.doesNotMatch(sanityClient, /\u00e2/);
});

test('unused blog migration and export artifacts stay removed', () => {
  const removedArtifacts = [
    ['scripts', 'migrate-blog-to-sanity.mjs'],
    ['scripts', 'patch-blog-cover-images.cjs'],
    ['scripts', 'blog-posts.ndjson'],
    ['scripts', 'blog-posts-with-images.ndjson'],
  ];

  for (const artifact of removedArtifacts) {
    assert.equal(
      fs.existsSync(repoPath(...artifact)),
      false,
      `Expected ${artifact.join('/')} to stay removed.`
    );
  }
});
