export const POSTS_QUERY = `
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    author,
    category,
    sourceUrl,
    image,
    coverImageUrl,
    body
  }
`;

export const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    author,
    category,
    sourceUrl,
    image,
    coverImageUrl,
    body
  }
`;
