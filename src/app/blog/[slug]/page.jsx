import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import HomeNavbar from '@/components/home/navbar';
import ShareButtons from '@/components/blog/share-buttons';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://trustandsafetyindia.org';
  const postUrl = `${siteUrl}/blog/${slug}`;
  return (
    <>
      <HomeNavbar />
      <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
        {/* Full Bleed Image Header */}
        <section className="relative w-full h-[60vh] min-h-[500px] max-h-[800px]">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              className="object-cover object-center z-0"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-stone-800 z-0" />
          )}

          {/* Gradients for text visibility on top of the image */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stone-950/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

          {/* Post Header Content Overlay */}
          <div className="absolute bottom-0 left-0 w-full z-20">
            <div className="mx-auto max-w-4xl px-5 pb-12 md:px-8">
              <div className="mb-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-white hover:text-rc-secondary dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to News
                </Link>
              </div>

              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rc-primary text-white text-xs font-black uppercase tracking-widest rounded-full">
                  <Tag className="w-3.5 h-3.5" />
                  {post.category}
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl lg:text-6xl mb-6 max-w-3xl leading-[1.1]">
                {post.title}
              </h1>

              {/* Author & Date Row */}
              <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base text-white">{post.author}</span>
                </div>
                <div className="h-4 w-px bg-white/30 hidden md:block"></div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-white/70" />
                  <span className="text-sm tracking-wide text-white/90">
                    {post.date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Post Body */}
        <article className="mx-auto max-w-3xl px-5 pt-16 md:px-8 bg-stone-50 dark:bg-stone-950">
          {/* Intro Excerpt / Lead Paragraph */}
          {post.excerpt && (
            <div className="mb-10 text-2xl font-medium leading-snug text-stone-900 dark:text-stone-100 border-l-4 border-rc-accent pl-6">
              {post.excerpt}
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-stone-700 dark:prose-p:text-stone-300">
            {post.body?.length ? (
              <PortableText
                value={post.body}
                components={{
                  block: {
                    normal: ({ children }) => (
                      <p className="mb-6 text-lg leading-[1.8] text-stone-800 dark:text-stone-300">
                        {children}
                      </p>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mt-10 mb-4 text-2xl font-bold text-stone-900 dark:text-stone-100">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mt-8 mb-3 text-xl font-bold text-stone-900 dark:text-stone-100">
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-6 border-l-4 border-rc-accent pl-6 text-stone-600 dark:text-stone-400 italic">
                        {children}
                      </blockquote>
                    ),
                  },
                }}
              />
            ) : post.content ? (
              post.content.split('\n').map((paragraph, idx) => {
                if (paragraph.trim() === '') {
                  return null;
                }

                return (
                  <p
                    key={idx}
                    className="mb-6 text-lg leading-[1.8] text-stone-800 dark:text-stone-300"
                  >
                    {paragraph}
                  </p>
                );
              })
            ) : (
              <p className="text-lg text-stone-600 dark:text-stone-300">
                Content for this post will appear here once it is published in
                Sanity.
              </p>
            )}
          </div>

          {/* Share Footer */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-8 pb-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 sm:mb-0">
              Share this article
            </h4>
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </article>
      </main>
    </>
  );
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();

  return posts
    .filter((post) => !post.sourceUrl)
    .map((post) => ({ slug: post.slug }));
}
