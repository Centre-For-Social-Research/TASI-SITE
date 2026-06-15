import { notFound } from 'next/navigation';
import BlogPostPage from '@/components/blog/blog-post-page';
import BreadcrumbJsonLd from '@/components/seo/breadcrumb-json-ld';
import JsonLdScript from '@/components/seo/json-ld-script';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';

const SITE_URL = 'https://trustandsafetyindia.org';

function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) {
    return `${SITE_URL}/opengraph-image`;
  }

  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'News and Blogs | TASI 2026',
    };
  }

  const description = post.excerpt || post.content?.slice(0, 160);
  const pagePath = `/blog/${slug}`;
  const pageUrl = `${SITE_URL}${pagePath}`;
  const imageUrl = absoluteUrl(post.image);
  const publishedTime = post.publishedAt || post.date;
  const modifiedTime = post.updatedAt || publishedTime;

  return {
    title: `${post.title} | TASI 2026`,
    description,
    authors: [{ name: post.author || 'TASI Team' }],
    alternates: {
      canonical: pagePath,
    },
    openGraph: {
      title: post.title,
      description,
      url: pageUrl,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [post.author || 'TASI Team'],
      section: post.category,
      images: [
        {
          url: imageUrl,
          width: 1600,
          height: 900,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BlogPostRoute({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const description = post.excerpt || post.content?.slice(0, 160);
  const pageUrl = `${SITE_URL}/blog/${slug}`;
  const imageUrl = absoluteUrl(post.image);
  const publishedAt = post.publishedAt || post.date;
  const updatedAt = post.updatedAt || publishedAt;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    additionalType: 'https://schema.org/BlogPosting',
    '@id': `${pageUrl}#article`,
    isPartOf: {
      '@id': `${SITE_URL}/blog#blog`,
    },
    headline: post.title,
    description,
    image: [imageUrl],
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      '@type': post.author === 'TASI Team' ? 'Organization' : 'Person',
      name: post.author || 'TASI Team',
    },
    articleSection: post.category,
    publisher: {
      '@type': 'Organization',
      name: 'Centre for Social Research',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/img/tasi-csr-logo.png`,
      },
    },
    mainEntityOfPage: pageUrl,
    about: [
      'Trust and Safety India Festival',
      'TASI 2026',
      'online safety',
      'platform accountability',
      'AI governance India',
    ],
  };

  return (
    <>
      <JsonLdScript data={articleJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: 'News and Blogs', url: '/blog' },
          { name: post.title, url: `/blog/${slug}` },
        ]}
      />
      <BlogPostPage post={post} slug={slug} />
    </>
  );
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();

  return posts
    .filter((post) => !post.sourceUrl)
    .map((post) => ({ slug: post.slug }));
}
