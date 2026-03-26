const fallbackApiVersion = '2026-03-01';

function cleanEnvValue(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

const rawDataset = cleanEnvValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'production'
);
const rawProjectId = cleanEnvValue(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

export const apiVersion = cleanEnvValue(
  process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  fallbackApiVersion
);

export const dataset = rawDataset;

export const projectId = rawProjectId || 'placeholder-project-id';

export const studioPreviewUrl = cleanEnvValue(
  process.env.SANITY_STUDIO_PREVIEW_URL,
  'http://localhost:3000'
);

export const isSanityConfigured = Boolean(rawProjectId && rawDataset);
