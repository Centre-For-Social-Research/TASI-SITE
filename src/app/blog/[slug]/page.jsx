import { notFound } from 'next/navigation';
import BlogPostPage from '@/components/blog/blog-post-page';
import BreadcrumbJsonLd from '@/components/seo/breadcrumb-json-ld';
import JsonLdScript from '@/components/seo/json-ld-script';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';

const SITE_URL = 'https://trustandsafetyindia.org';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'News and Blogs | TASI 2026',
    };
  }

  const description = post.excerpt || post.content?.slice(0, 160);

  return {
    title: `${post.title} | TASI 2026`,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      url: `/blog/${slug}`,
      type: 'article',
      images: post.image ? [post.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.image ? [post.image] : ['/twitter-image'],
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
  const imageUrl = post.image?.startsWith('http')
    ? post.image
    : post.image
      ? `${SITE_URL}${post.image}`
      : `${SITE_URL}/opengraph-image`;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: post.title,
    description,
    image: [imageUrl],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'TASI Team',
    },
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
