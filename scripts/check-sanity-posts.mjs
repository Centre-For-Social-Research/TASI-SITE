import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [
      l.slice(0, l.indexOf('=')).trim(),
      l.slice(l.indexOf('=') + 1).trim(),
    ])
);

const p = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const d = env.NEXT_PUBLIC_SANITY_DATASET;
const q = encodeURIComponent(
  '*[_type == "post"]{ "slug": slug.current, title }'
);
const res = await fetch(
  `https://${p}.api.sanity.io/v2024-01-01/data/query/${d}?query=${q}`
);
const j = await res.json();
console.log(JSON.stringify(j.result, null, 2));
