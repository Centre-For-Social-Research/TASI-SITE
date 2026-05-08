import { createClient } from '@sanity/client';
import {
  apiVersion,
  dataset,
  isSanityConfigured,
  projectId,
} from '@/sanity/env';

export const client = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      stega: false,
      timeout: 8000,
    })
  : null;

/** Next.js fetch cache options - revalidate every 60 s */
export const sanityFetchOptions = { next: { revalidate: 60 } };
