import { createClient } from 'next-sanity';
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
    })
  : null;
