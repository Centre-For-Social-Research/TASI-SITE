'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import BlogPostCard from '@/components/blog/blog-post-card';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { blogIndexCopy, blogIndexCta, blogIndexHero } from '@/data/blog-page';

export default function BlogPageClient({ posts, categories }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;

  return (
    <>
      <HomeNavbar />
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {blogIndexHero.eyebrow}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {blogIndexHero.title}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              {blogIndexHero.description}
            </p>
          </div>
        </BrandedPageHero>

        <section className="bg-gray-50 px-4 py-12 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              {blogIndexCopy.filterHeading}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-6 py-2 font-semibold transition-all ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] text-white'
                    : 'border border-gray-300 text-gray-600 hover:border-purple-500 dark:border-gray-600 dark:text-gray-300'
                }`}
              >
                {blogIndexCopy.allPostsLabel}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-6 py-2 font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] text-white'
                      : 'border border-gray-300 text-gray-600 hover:border-purple-500 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
              {filteredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {blogIndexCopy.emptyMessage}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-gray-50 px-4 py-16 dark:bg-gray-800">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {blogIndexCta.title}
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
              {blogIndexCta.description}
            </p>
            <Link
              href={blogIndexCta.href}
              className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] px-8 py-3 text-lg font-bold text-white transition-transform hover:scale-[1.02] hover:opacity-90"
            >
              {blogIndexCta.label}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
