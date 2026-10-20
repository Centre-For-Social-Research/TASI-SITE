import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: ['.next/**', '.worktrees/**', 'legacy/**/dist/**'],
  },
  {
    // Share images are rendered to PNG by next/og, where <img> is required.
    files: ['src/app/**/opengraph-image.js', 'src/app/**/twitter-image.js'],
    rules: { '@next/next/no-img-element': 'off' },
  },
];

export default config;
