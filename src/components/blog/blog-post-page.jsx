import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import ShareButtons from '@/components/blog/share-buttons';
import HomeNavbar from '@/components/home/navbar';
import { blogPostFallbackCopy } from '@/data/blog-page';

function getBlockText(block) {
  return block.children?.map((child) => child.text).join('') || '';
}

function SanityBodyBlock({ block }) {
  const children = getBlockText(block);

  if (!children) {
    return null;
  }

  switch (block.style) {
    case 'h2':
      return (
        <h2 className="mt-10 mb-4 text-2xl font-bold text-stone-900 dark:text-stone-100">
          {children}
        </h2>
      );
    case 'h3':
      return (
        <h3 className="mt-8 mb-3 text-xl font-bold text-stone-900 dark:text-stone-100">
          {children}
        </h3>
      );
    case 'blockquote':
      return (
        <blockquote className="my-6 border-l-4 border-rc-accent pl-6 text-stone-600 italic dark:text-stone-400">
          {children}
        </blockquote>
      );
    default:
      return (
        <p className="mb-6 text-lg leading-[1.8] text-stone-800 dark:text-stone-300">
          {children}
        </p>
      );
  }
}

function BlogPostBody({ post }) {
  if (post.body?.length) {
    return post.body.map((block, idx) => (
      <SanityBodyBlock
        key={block._key || `${post.slug}-block-${idx}`}
        block={block}
      />
    ));
  }

  if (post.content) {
    return post.content.split('\n').map((paragraph, idx) => {
      if (paragraph.trim() === '') {
        return null;
      }

      return (
        <p
          key={`${post.slug}-paragraph-${idx}`}
          className="mb-6 text-lg leading-[1.8] text-stone-800 dark:text-stone-300"
        >
          {paragraph}
        </p>
      );
    });
  }

  return (
    <p className="text-lg text-stone-600 dark:text-stone-300">
      {blogPostFallbackCopy.emptyBody}
    </p>
  );
}

export default function BlogPostPage({ post, slug }) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || blogPostFallbackCopy.defaultSiteUrl;
  const postUrl = `${siteUrl}/blog/${slug}`;

  return (
    <>
      <HomeNavbar />
      <main className="min-h-screen bg-stone-50 pb-20 dark:bg-stone-950">
        <section className="relative h-[60vh] max-h-[800px] min-h-[500px] w-full">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              className="z-0 object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 z-0 h-full w-full bg-stone-800" />
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-stone-950/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
          <div className="pointer-events-none absolute inset-0 z-10 bg-black/20" />

          <div className="absolute bottom-0 left-0 z-20 w-full">
            <div className="mx-auto max-w-4xl px-5 pb-12 md:px-8">
              <div className="mb-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-white transition-colors hover:text-rc-secondary dark:hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {blogPostFallbackCopy.backLabel}
                </Link>
              </div>

              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rc-primary px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                  <Tag className="h-3.5 w-3.5" />
                  {post.category}
                </span>
              </div>

              <h1 className="mb-6 max-w-3xl text-3xl font-black leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 font-medium text-white/90">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-base text-white">{post.author}</span>
                </div>
                <div className="hidden h-4 w-px bg-white/30 md:block" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-white/70" />
                  <span className="text-sm tracking-wide text-white/90">
                    {post.date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-3xl bg-stone-50 px-5 pt-16 dark:bg-stone-950 md:px-8">
          {post.excerpt && (
            <div className="mb-10 border-l-4 border-rc-accent pl-6 text-2xl font-medium leading-snug text-stone-900 dark:text-stone-100">
              {post.excerpt}
            </div>
          )}

          <div className="prose prose-lg max-w-none prose-p:text-stone-700 dark:prose-invert dark:prose-p:text-stone-300">
            <BlogPostBody post={post} />
          </div>

          <div className="mt-16 flex flex-col items-center justify-between border-t border-stone-200 pt-8 pb-4 dark:border-stone-800 sm:flex-row">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-stone-500 sm:mb-0">
              {blogPostFallbackCopy.shareHeading}
            </h4>
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </article>
      </main>
    </>
  );
}
