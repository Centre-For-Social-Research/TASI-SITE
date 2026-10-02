# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint (zero warnings allowed)
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
npm run test         # Run all tests
npx tsc --noEmit     # Type check (no dedicated npm script; CI runs this)
```

**Run a single test file:**

```bash
node --test tests/some-module.test.cjs
```

**Load testing (K6, against production-safe endpoints):**

```bash
npm run loadtest:messages:prod-safe
```

**Environment:** Copy `.env.example` to `.env.local` and fill in all values before running locally.

**CI (`.github/workflows/ci.yml`, Node 24):** PRs to `main` must pass lint, `format:check`, `tsc --noEmit`, tests, `npm audit --audit-level=high`, and build — run these before pushing.

## Architecture

**TASI 2026** is the official conference website for The Centre For Social Research. It is a Next.js 16 (App Router) site with two main domains: public content (event info, speakers, programme, blog, media) and the registration/admin console (review, passes, invitations, reminders, check-in).

### Data Layer

| Service                   | Purpose                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Supabase (PostgreSQL)** | All transactional data: registrations, passes, email jobs, guest invitations, speaker badges, reminders, check-ins        |
| **Sanity CMS**            | Blog posts only; Studio accessible at `/studio`                                                                           |
| **Clerk**                 | Auth (OIDC/OAuth). Access mode controlled by `CLERK_ACCESS_MODE` env var (`email_allowlist`, `metadata_roles`, or `both`) |
| **Resend**                | Transactional email (pass issuance, confirmations, bulk jobs); delivery webhooks hit `/api/resend/webhooks`               |
| **Upstash Redis**         | Rate limiting; falls back to in-memory if not configured                                                                  |
| **Sentry**                | Error tracking; only enabled in `NODE_ENV === 'production'` (10% trace sampling)                                          |

### API Routes (`/src/app/api`)

Public-facing routes are protected with helpers from `src/lib/api-security.js`:

- `protectPublicRoute()` — CORS origin check + rate limiting (5 req / 10 min per IP by default)
- `protectPublicPostRoute()` — above + enforces `Content-Type: application/json`

Admin routes use `requireAuthorizedOperator()` from `src/lib/registration-auth.js` for Clerk-based role enforcement.

### Registration System

The registration flow covers application submission → admin review → confirmation → pass issuance → check-in. Key concepts:

- **Status lifecycle:** `pending` → `confirmed` / `waitlisted` / `rejected`
- **Pass issuance** generates a PDF badge + QR token stored in Supabase (`entry_passes`)
- **Email jobs** are processed asynchronously: a job record is created, then items are processed via `/api/admin/passes/jobs/process`, `/api/admin/email-jobs/process` and the Vercel cron route `/api/internal/registration-ops/drain` — these are not synchronous send-and-forget calls
- Admin bulk actions (resend, export, issue passes) are in `/src/app/api/admin/registrations/`

### Admin Console Tabs

Besides registration review (`/admin/registrations`), the console has: guest invitations, spot (on-site desk) registrations, speaker communications (speaker badges), reminders (T-minus event emails), email jobs, delivery history, submissions inbox (contact/media/speaker/volunteer forms), check-in, audit and settings. Each tab has a matching API folder under `/src/app/api/admin/`.

### Auth Pattern in Admin

The admin section (`/admin/*`) checks authorization at the route level. `CLERK_ADMIN_EMAILS` grants full admin access; `CLERK_REVIEWER_EMAILS` grants read-only reviewer access. The admin layout wraps all pages in `AdminExitGuard` to prevent accidental navigation loss during active operations.

### Tests

Tests live in `/tests/*.test.cjs` and use the Node.js native test runner (`node:test`, `node:assert/strict`). Test modules are CommonJS. The library modules they test often have a `.cjs` sibling in `/src/lib/` — pure logic extracted for testability, separate from Next.js server-only modules.

### Static Data vs. Database

Speaker bios, programme agenda, partner logos, and reception details are stored as static JS/TS files under `/src/data/`. Only transactional data (registrations, passes, check-ins, admin jobs) lives in Supabase.

### Database Schema & Docs

- `supabase/schema.sql` is the canonical reference for the Supabase table definitions; incremental changes go in `supabase/migrations/` (apply before deploying matching code).
- Operational runbooks (load testing, registration-ops peak readiness) live in `docs/runbooks/`; registration-ops setup is documented in `docs/registration-ops-setup.md`.

### Mixed JS/TS

The codebase mixes JavaScript and TypeScript (`jsconfig.json` + `tsconfig.json` both present). Match the language of the file/module you are editing; new Sanity and data modules tend to be TS, most `src/lib/` server modules are JS with `.cjs` test siblings.

### Chatbot

A Gemini-powered chatbot is wired into the root layout. Its knowledge base is `src/data/tasi-knowledge.ts`. The API endpoint is `/api/chat`.

## Design Rules

- Box/card/panel corner radius must be **`10px` exactly** — not `rounded-lg`, not `12px`, not `8px`.
- Do not modify button styles unless explicitly asked.
