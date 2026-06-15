import { cache } from 'react';
import { blogCategories, blogPosts } from '@/data/blog-posts';
import { client, sanityFetchOptions } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import { POSTS_QUERY, POST_BY_SLUG_QUERY } from '@/sanity/lib/queries';
import { isSanityConfigured } from '@/sanity/env';

function formatDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(dateValue));
}

function toIsoDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizePostDates(post) {
  const publishedAt = toIsoDate(post.publishedAt || post.date);
  const updatedAt = toIsoDate(post.updatedAt || post._updatedAt) || publishedAt;

  return {
    ...post,
    date: post.date || formatDate(publishedAt),
    publishedAt,
    updatedAt,
  };
}

function portableTextToPlainText(blocks = []) {
  return blocks
    .filter(
      (block) => block?._type === 'block' && Array.isArray(block.children)
    )
    .map((block) => block.children.map((child) => child.text).join(''))
    .join('\n\n');
}

function normalizeSanityPost(post) {
  const plainTextContent = portableTextToPlainText(post.body);
  const excerpt = post.excerpt || plainTextContent.slice(0, 180);

  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt,
    date: formatDate(post.publishedAt),
    publishedAt: toIsoDate(post.publishedAt),
    updatedAt: toIsoDate(post._updatedAt) || toIsoDate(post.publishedAt),
    author: post.author || 'TASI Team',
    category: post.category || 'ANNOUNCEMENT',
    content: plainTextContent,
    body: post.body || [],
    image: post.image
      ? urlForImage(post.image)?.width(1600).height(900).url()
      : post.coverImageUrl || null,
    sourceUrl: post.sourceUrl || null,
  };
}

async function fetchSanityPosts() {
  if (!isSanityConfigured || !client) {
    return [];
  }

  const posts = await client.fetch(POSTS_QUERY, {}, sanityFetchOptions);
  return posts.map(normalizeSanityPost);
}

async function fetchSanityPostBySlug(slug) {
  if (!isSanityConfigured || !client) {
    return null;
  }

  const post = await client.fetch(
    POST_BY_SLUG_QUERY,
    { slug },
    sanityFetchOptions
  );
  return post ? normalizeSanityPost(post) : null;
}

export const getBlogPosts = cache(async () => {
  try {
    const sanityPosts = await fetchSanityPosts();
    return (sanityPosts.length > 0 ? sanityPosts : blogPosts).map(
      normalizePostDates
    );
  } catch (error) {
    console.error('Failed to fetch Sanity posts, using local fallback.', error);
    return blogPosts.map(normalizePostDates);
  }
});

export const getBlogPostBySlug = cache(async (slug) => {
  try {
    const sanityPost = await fetchSanityPostBySlug(slug);
    if (sanityPost) {
      return sanityPost;
    }
  } catch (error) {
    console.error(`Failed to fetch Sanity post for slug "${slug}".`, error);
  }

  const fallbackPost = blogPosts.find((post) => post.slug === slug);
  return fallbackPost ? normalizePostDates(fallbackPost) : null;
});

export const getBlogCategoryList = cache(async () => {
  const posts = await getBlogPosts();
  const categories = Array.from(
    new Set(posts.map((post) => post.category).filter(Boolean))
  );

  return categories.length > 0 ? categories : blogCategories;
});
