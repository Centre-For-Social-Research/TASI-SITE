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

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const token = env.SANITY_API_TOKEN;

const imagePath = 'public/Your paragraph text.jpg';
const file = readFileSync(imagePath);

const uploadRes = await fetch(
  `https://${projectId}.api.sanity.io/v2024-01-01/assets/images/${dataset}?filename=uk-under-16-social-media-ban-cover.jpg`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'image/jpeg',
      Authorization: `Bearer ${token}`,
    },
    body: file,
  }
);
const upload = await uploadRes.json();
if (!upload.document?._id) {
  console.error('Upload failed:', JSON.stringify(upload));
  process.exit(1);
}
console.log('Uploaded asset:', upload.document._id);

const patchRes = await fetch(
  `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mutations: [
        {
          patch: {
            id: 'post-uk-under-16-social-media-ban',
            set: {
              image: {
                _type: 'image',
                asset: { _type: 'reference', _ref: upload.document._id },
              },
            },
            unset: ['coverImageUrl'],
          },
        },
      ],
    }),
  }
);
console.log(patchRes.status, JSON.stringify(await patchRes.json()));
