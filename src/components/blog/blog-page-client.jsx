'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, User } from 'lucide-react';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';

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
              Blog & News
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Latest Updates & Insights
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Stay informed with news, announcements, and insights from the
              Trust and Safety Forum
            </p>
          </div>
        </BrandedPageHero>

        <section className="bg-gray-50 px-4 py-12 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              Filter by Category
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
                All Posts
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
                <article
                  key={post.id}
                  id={post.slug}
                  className="flex flex-col gap-6 overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-lg dark:border-gray-700 md:flex-row"
                >
                  <div className="md:w-80 md:flex-shrink-0">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={640}
                        height={768}
                        className="h-64 w-full object-cover md:h-96"
                      />
                    ) : (
                      <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 md:h-96" />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="mb-3 flex items-center gap-4">
                        <span className="inline-block rounded-full bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] px-3 py-1 text-xs font-semibold text-white">
                          {post.category}
                        </span>
                      </div>
                      <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                        {post.title}
                      </h3>
                      <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                        {post.excerpt || `${post.content.substring(0, 150)}...`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4" />
                        {post.author}
                      </div>
                      {post.sourceUrl ? (
                        <a
                          href={post.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto inline-flex items-center gap-2 font-semibold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          Read Article <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="ml-auto inline-flex items-center gap-2 font-semibold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          Jump to Post <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  No posts found in this category.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-gray-50 px-4 py-16 dark:bg-gray-800">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Ready to Join TASI 2026?
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
              Register now and be part of the conversation shaping digital trust
              and safety in India.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] px-8 py-3 text-lg font-bold text-white transition-transform hover:scale-[1.02] hover:opacity-90"
            >
              Register Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
