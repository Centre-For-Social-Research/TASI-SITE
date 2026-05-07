# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint (zero warnings allowed)
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
npm run test         # Run all tests
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

## Architecture

**TASI 2026** is the official conference website for The Centre For Social Research. It is a Next.js 16 (App Router) site with three distinct functional domains: public content, event registration, and ticketing/payments.

### Data Layer

| Service                   | Purpose                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Supabase (PostgreSQL)** | All transactional data: registrations, tickets, payments, jobs, check-ins                                                 |
| **Sanity CMS**            | Blog posts only; Studio accessible at `/studio`                                                                           |
| **Clerk**                 | Auth (OIDC/OAuth). Access mode controlled by `CLERK_ACCESS_MODE` env var (`email_allowlist`, `metadata_roles`, or `both`) |
| **Razorpay**              | Payment processing for ticketing; webhooks hit `/api/webhooks/razorpay`                                                   |
| **Resend**                | Transactional email (pass issuance, confirmations, bulk jobs)                                                             |
| **Upstash Redis**         | Rate limiting; falls back to in-memory if not configured                                                                  |
| **Sentry**                | Error tracking; only enabled in `NODE_ENV === 'production'` (10% trace sampling)                                          |

### API Routes (`/src/app/api`)

All API responses use the helpers from `src/lib/api-response.js`:

- `ok(data)` → `{ok: true, data}` 200
- `created(data)` → `{ok: true, data}` 201
- `error(message, status)` → `{ok: false, error}`
- `paginated(data, meta)` → `{ok: true, data, meta}`
- `unauthorized()`, `forbidden()`, `notFound()`, `tooManyRequests()`, `serverError()`

Public-facing routes are protected with helpers from `src/lib/api-security.js`:

- `protectPublicRoute()` — CORS origin check + rate limiting (5 req / 10 min per IP by default)
- `protectPublicPostRoute()` — above + enforces `Content-Type: application/json`

Admin routes use `requireAuthorizedOperator()` from `src/lib/registration-auth.js` for Clerk-based role enforcement.

### Registration System

The registration flow covers application submission → admin review → confirmation → pass issuance → check-in. Key concepts:

- **Status lifecycle:** `pending` → `confirmed` / `waitlisted` / `rejected`
- **Pass issuance** generates a PDF badge + QR token stored in Supabase (`entry_passes`)
- **Email jobs** are processed asynchronously: a job record is created, then items are processed via `/api/admin/passes/process` and `/api/internal/registration-ops/*` — these are not synchronous send-and-forget calls
- Admin bulk actions (resend, export, issue passes) are in `/src/app/api/admin/registrations/`

### Festival Ticketing

Separate from registrations. Uses Razorpay for payments. Key tables: `festival_ticket_users`, `festival_tickets`, `festival_payment_audit_log`. Payment flow: `create-order` → Razorpay checkout → `verify-payment` → webhook deduplication via `ticket_webhook_events`.

### Auth Pattern in Admin

The admin section (`/admin/*`) checks authorization at the route level. `CLERK_ADMIN_EMAILS` grants full admin access; `CLERK_REVIEWER_EMAILS` grants read-only reviewer access. The admin layout wraps all pages in `AdminExitGuard` to prevent accidental navigation loss during active operations.

### Tests

Tests live in `/tests/*.test.cjs` and use the Node.js native test runner (`node:test`, `node:assert/strict`). Test modules are CommonJS. The library modules they test often have a `.cjs` sibling in `/src/lib/` — pure logic extracted for testability, separate from Next.js server-only modules.

### Static Data vs. Database

Speaker bios, programme agenda, partner logos, and reception details are stored as static JS/TS files under `/src/data/`. Only transactional data (registrations, tickets, check-ins) lives in Supabase.

### Chatbot

A Gemini-powered chatbot is wired into the root layout. Its knowledge base is `src/data/tasi-knowledge.ts`. The API endpoint is `/api/chat`.

## Design Rules

- Box/card/panel corner radius must be **`10px` exactly** — not `rounded-lg`, not `12px`, not `8px`.
- Do not modify button styles unless explicitly asked.
