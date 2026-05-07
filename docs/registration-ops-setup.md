# TASI 2026 Registration Ops Setup

## Clerk access mode

The app now supports three authorization modes for internal registration tools:

- `email_allowlist`
- `metadata_roles`
- `both`

Current default:

```env
CLERK_ACCESS_MODE=both
```

Recommended launch setup:

- Keep `CLERK_ACCESS_MODE=both`
- Put the final approval owner in `CLERK_ADMIN_EMAILS`
- Put screening reviewers in `CLERK_REVIEWER_EMAILS`
- Optionally also set Clerk public metadata `tasiRole=admin` or `tasiRole=reviewer` for longer-term role management

Example:

```env
CLERK_ADMIN_EMAILS=saquib@csrindia.org
CLERK_REVIEWER_EMAILS=reviewer1@csrindia.org,reviewer2@csrindia.org
```

## Badge logo

The badge export and QR pass PDF use this local file path:

```env
BADGE_LOGO_FILE_PATH=
```

Leave this blank in Vercel unless you have uploaded a logo file into the deployment filesystem. When blank, badge generation uses `public/img/tasi-csr-logo.png`.

## Resend webhook

Create a webhook in Resend and point it to:

- Production: `https://trustandsafetyindia.org/api/resend/webhooks`
- Local development: use a tunnel URL that forwards to `/api/resend/webhooks`

Recommended events:

- `email.sent`
- `email.delivered`
- `email.bounced`
- `email.complained`

After creating the webhook, copy the signing secret into:

```env
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

## Required env vars

Minimum registration/admin setup:

```env
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Saquib@csrindia.org
RESEND_WEBHOOK_SECRET=...
CLERK_ACCESS_MODE=both
CLERK_ADMIN_EMAILS=saquib@csrindia.org
CLERK_REVIEWER_EMAILS=reviewer1@csrindia.org,reviewer2@csrindia.org
BADGE_LOGO_FILE_PATH=
SITE_URL=https://trustandsafetyindia.org
NEXT_PUBLIC_SITE_URL=https://trustandsafetyindia.org
```

## Launch checklist

1. Run the SQL in `supabase/schema.sql`.
2. Confirm the `registration-profile-photos` storage bucket exists.
3. Set the env vars above in local and hosting environments.
4. Add the final admin/reviewer emails to the Clerk allowlists.
5. Create the Resend webhook for `/api/resend/webhooks`.
6. Sign in with an allowlisted Clerk account and test:
   - registration submit
   - status update email
   - QR pass issue batch
   - badge export
   - check-in scan/manual lookup
