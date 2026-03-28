# TASI 2026

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 3
- ESLint
- Prettier

## Scripts

- `npm run dev` - start local development server
- `npm run build` - production build check
- `npm run start` - run production build
- `npm run lint` - lint checks
- `npm run format` - format files with Prettier
- `npm run format:check` - verify formatting

## Clerk Setup

1. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from your Clerk dashboard to `.env.local` and your hosting provider.
2. Set `CLERK_ACCESS_MODE`, `CLERK_ADMIN_EMAILS`, and `CLERK_REVIEWER_EMAILS` to control who can access the admin and check-in tools.
3. Redeploy after adding the Clerk keys. If these are missing in production, the app can fail with a server error because Clerk now wraps the root layout.

## Resend Setup

1. Add the Resend environment variables from `.env.example` to `.env.local` and your hosting provider.
2. Verify the `jamsaq.in` sending domain in Resend and use a sender such as `noreply@jamsaq.in` for `RESEND_FROM_EMAIL`.
3. Set `INBOUND_NOTIFICATION_EMAILS` to the team inboxes that should receive website form alerts. If omitted, alerts fall back to `info1@csrindia.org`.
4. Create a Resend webhook pointing to `/api/resend/webhooks` on your deployed site and subscribe to `email.delivered`, `email.bounced`, and `email.complained`.
5. Check `/api/health` after deploy to confirm the Resend config is present.

Resend currently powers registration lifecycle emails and internal alert emails for newsletter signups, contact messages, speaker applications, volunteer applications, media accreditation requests, and registration confirmation requests.

### Quick test

To send a basic Resend test email from this project:

1. Replace `re_xxxxxxxxx` in `.env.local` with your real `RESEND_API_KEY`.
2. Set `RESEND_FROM_EMAIL` to a verified sender such as `noreply@jamsaq.in`.
3. Send a `POST` request to `/api/resend/test`.
