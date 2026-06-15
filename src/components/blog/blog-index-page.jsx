import BlogPageClient from '@/components/blog/blog-page-client';
import JsonLdScript from '@/components/seo/json-ld-script';
import { blogIndexMetadata } from '@/data/blog-page';
import { getBlogCategoryList, getBlogPosts } from '@/lib/blog';

const SITE_URL = 'https://trustandsafetyindia.org';

function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) {
    return `${SITE_URL}/opengraph-image`;
  }

  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;
}

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getBlogCategoryList(),
  ]);
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name: 'Trust and Safety India Festival News and Blogs',
    description: blogIndexMetadata.description,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    blogPost: posts.slice(0, 12).map((post) => ({
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/${post.slug}#article`,
      url: `${SITE_URL}/blog/${post.slug}`,
      headline: post.title,
      description: post.excerpt,
      image: absoluteUrl(post.image),
      datePublished: post.publishedAt || post.date,
      dateModified: post.updatedAt || post.publishedAt || post.date,
      author: {
        '@type': post.author === 'TASI Team' ? 'Organization' : 'Person',
        name: post.author || 'TASI Team',
      },
      articleSection: post.category,
    })),
  };

  return (
    <>
      <JsonLdScript data={blogJsonLd} />
      <BlogPageClient posts={posts} categories={categories} />
    </>
  );
}
