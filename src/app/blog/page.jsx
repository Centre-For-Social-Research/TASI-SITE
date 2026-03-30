import BlogPageClient from '@/components/blog/blog-page-client';
import { getBlogCategoryList, getBlogPosts } from '@/lib/blog';

export const revalidate = 1800;

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getBlogCategoryList(),
  ]);

  return <BlogPageClient posts={posts} categories={categories} />;
}
