# TASI 2026 Registration Ops Setup

## Admin console access

Access comes only from verified email addresses on two lists:

- `CLERK_ADMIN_EMAILS` / `CLERK_REVIEWER_EMAILS` in the environment. Keep these
  to one or two break-glass owners.
- The admin and reviewer emails added in **Admin → Settings → Access Control**.
  This is the normal way to give or remove access; it needs no redeploy, and
  every change is written to the audit log.

Clerk `publicMetadata` roles do not grant access. The TASi-App shares this Clerk
instance and uses `publicMetadata.role` for its own admins. `CLERK_ACCESS_MODE`
is no longer read.

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
