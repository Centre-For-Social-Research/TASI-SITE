import BlogIndexPage from '@/components/blog/blog-index-page';
import { blogIndexMetadata } from '@/data/blog-page';

export const metadata = blogIndexMetadata;
export const revalidate = 1800;

export default function BlogPage() {
  return <BlogIndexPage />;
}
