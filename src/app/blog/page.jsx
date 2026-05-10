import BlogIndexPage from '@/components/blog/blog-index-page';
import PageSeoJsonLd from '@/components/seo/page-seo-json-ld';
import { blogIndexMetadata } from '@/data/blog-page';

export const metadata = blogIndexMetadata;
export const revalidate = 1800;

export default function BlogPage() {
  return (
    <>
      <PageSeoJsonLd
        path="/blog"
        name="Trust and Safety India Festival News and Blogs"
        description={blogIndexMetadata.description}
        breadcrumbName="News and Blogs"
        about={[
          'TASI news',
          'Trust and Safety India Festival blog',
          'online safety commentary',
          'AI governance India',
        ]}
      />
      <BlogIndexPage />
    </>
  );
}
