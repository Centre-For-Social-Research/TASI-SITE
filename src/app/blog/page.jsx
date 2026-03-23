"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import HomeNavbar from "@/components/home/navbar";
import BrandedPageHero from "@/components/ui/branded-page-hero";
import { blogCategories, blogPosts } from "@/data/blog-posts";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredPosts = selectedCategory 
    ? blogPosts.filter(post => post.category === selectedCategory)
    : blogPosts;

  return (
    <>
      <HomeNavbar />
      <main className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Blog & News</p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Latest Updates & Insights
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Stay informed with news, announcements, and insights from the Trust and Safety Forum
            </p>
          </div>
        </BrandedPageHero>

        {/* Filter Section */}
        <section className="py-12 px-4 bg-gray-50 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Filter by Category</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === null
                    ? "bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] text-white"
                    : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-500"
                }`}
              >
                All Posts
              </button>
              {blogCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] text-white"
                      : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-500"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  id={post.slug}
                  className="flex flex-col md:flex-row gap-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="md:w-80 flex-shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-64 md:h-96 object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] text-white text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">
                        {post.content}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <a
                        href={post.sourceUrl || `#${post.slug}`}
                        target={post.sourceUrl ? "_blank" : undefined}
                        rel={post.sourceUrl ? "noreferrer" : undefined}
                        className="ml-auto inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
                      >
                        {post.sourceUrl ? "Read Article" : "Jump to Post"}
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No posts found in this category.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Join TASI 2026?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
              Register now and be part of the conversation shaping digital trust and safety in India.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#55089e] via-[#9f0099] to-[#ff0080] px-8 py-3 text-lg font-bold text-white transition-transform hover:scale-[1.02] hover:opacity-90"
            >
              Register Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
