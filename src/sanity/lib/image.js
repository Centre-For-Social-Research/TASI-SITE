import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { isSanityConfigured } from '@/sanity/env';

const builder = isSanityConfigured && client ? imageUrlBuilder(client) : null;

export function urlForImage(source) {
  if (!builder || !source) {
    return null;
  }

  return builder.image(source);
}
