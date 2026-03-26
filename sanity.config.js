import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import {
  apiVersion,
  dataset,
  projectId,
  studioPreviewUrl,
} from './src/sanity/env';
import { schemaTypes } from './src/sanity/schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'TASI CMS',
  projectId,
  dataset,
  basePath: '/studio',
  schema: {
    types: schemaTypes,
  },
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    productionUrl: async (prev, context) => {
      const { document } = context;

      if (document?._type === 'post' && document?.slug?.current) {
        return `${studioPreviewUrl}/blog/${document.slug.current}`;
      }

      return studioPreviewUrl;
    },
  },
});
