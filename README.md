# TASI 2026 - Next.js Migration Workspace

This workspace has been migrated from a static site baseline to a modern Next.js App Router project with Tailwind CSS.

## Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 3
- ESLint (next lint)

## Scripts
- `npm run dev` - start local development server
- `npm run build` - production build check
- `npm run start` - run production build
- `npm run lint` - lint checks

## Legacy Source Placement
Legacy static assets were moved (not edited) into:
- `legacy/static-site/`

This includes:
- HTML pages
- CSS files
- JS files
- image assets

## Next Migration Plan
1. Convert each legacy HTML page into a route under `src/app`.
2. Extract shared layout sections (navbar, footer, hero blocks) into `src/components`.
3. Replace legacy script globals with React components and hooks.
4. Port legacy styles incrementally into Tailwind utility classes.
5. Move reusable data from legacy JS files into typed modules under `src/lib` or `src/data`.
