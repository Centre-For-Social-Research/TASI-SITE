import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

export default function BlogPostCard({ post }) {
  const contentPreview = post.content
    ? `${post.content.substring(0, 150)}...`
    : '';
  const excerpt = post.excerpt || contentPreview;

  return (
    <article
      id={post.slug}
      className="flex flex-col gap-6 overflow-hidden rounded-[10px] border border-gray-200 transition-shadow hover:shadow-lg dark:border-gray-700 md:flex-row"
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
            {excerpt}
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
  );
}
