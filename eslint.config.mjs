import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: ['legacy/**/dist/**'],
  },
];

export default config;
