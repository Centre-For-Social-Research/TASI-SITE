import { notFound } from 'next/navigation';
import BlogPostPage from '@/components/blog/blog-post-page';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';

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
    openGraph: {
      title: post.title,
      description,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostRoute({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostPage post={post} slug={slug} />;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();

  return posts
    .filter((post) => !post.sourceUrl)
    .map((post) => ({ slug: post.slug }));
}
