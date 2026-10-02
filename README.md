# TASI 2026

The official website for TASI 2026 — the annual conference of The Centre For Social Research. This site covers event information, speaker profiles, programme details, registration, sponsorship, media coverage, and the internal admin console used to review registrations and send passes, invitations and reminders.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 3
- Supabase (database), Clerk (admin sign-in), Sanity (blog), Resend (email)
- ESLint, Prettier, Node test runner

## Scripts

- `npm run dev` - start local development server
- `npm run build` - production build check
- `npm run start` - run production build
- `npm run lint` - lint checks
- `npm run format` - format files with Prettier
- `npm run format:check` - verify formatting
- `npm run test` - run tests

## Environment Setup

Copy `.env.example` to `.env.local` and fill in the required values before running locally. See `.env.example` for all required variables.

See `CLAUDE.md` for architecture notes and `docs/` for operational runbooks.
