# Supabase cleanup and move to Mumbai

Plan drafted 2026-10-22, after TASI 2026. Two goals:

1. Remove everything TASi-App left in the shared Supabase project (the app plan is dropped).
2. Move the database from Seoul (`ap-northeast-2`) to Mumbai (`ap-south-1`), so Vercel functions no longer need the `icn1` pin.

Work through the phases in order. Each phase ends in a working site; stop between phases if needed.

## Current state (checked 2026-10-22)

- One project: `TASI-SITE` (`ttkqwqayvfwiwfszaqzk`), Seoul, Postgres 17, free plan. Room for one more free project.
- Database 31 MB, 54 public tables. Storage about 116 MB in 5 buckets.
- The website talks to Supabase only through `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server side). It stores storage _paths_, not full URLs, except QR pass images, which are emailed as public URLs (`registration-pass-assets.js`).
- The Vercel `icn1` pin is a dashboard setting (Project → Settings → Functions), not in the repo.

### TASi-App objects to remove

| Kind                       | Objects                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tables                     | `profiles`, `speaker_emails`, `connections`, `networking_consent`, `networking_consents`, `networking_messages`, `networking_reports`, `session_polls`, `session_poll_votes`, `session_qa`, `session_qa_upvotes`, `saved_sessions`, `user_bookmarks`, `user_push_tokens`, `notification_jobs`, `app_feedback`, `app_config`, `app_rate_limits`                                                                                                                                                                               |
| Views                      | `v_directory`, `v_user_full`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Triggers on website tables | `event_registrations_role_sync`, `event_registrations_push_confirmed` (on `event_registrations`)                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Functions                  | `event_registrations_sync_profile_role`, `event_registrations_push_confirmed`, `networking_messages_push_trigger`, `enqueue_notification_job`, `notify_push`, `wake_push_fanout_queue`, `speaker_emails_sync_existing_profile`, `profiles_autolink_speaker_trigger`, `profiles_set_updated_at`, `profiles_set_role_trigger`, `speaker_emails_set_updated_at`, `session_qa_upvotes_recount`, `user_push_tokens_handoff_before_write`, `clerk_user_id`, `clerk_role` (drop the last two only if no remaining policy uses them) |
| Realtime                   | Publication entries for `session_polls`, `session_poll_votes`, `session_qa`, `session_qa_upvotes`, `networking_messages`, `connections`                                                                                                                                                                                                                                                                                                                                                                                      |
| Edge Function              | `push-fanout`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Storage                    | `chat-attachments` bucket (491 files, 33 MB)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Vault                      | 2 secrets, probably the push fan-out URL and key; confirm before deleting                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

**Keep `app_idempotency_keys`.** The website uses it despite the `app_` prefix.

## Phase 0: Backups and keep-alive (PR 1)

Done 2026-10-22. The GitHub backup workflow uploaded unencrypted database dumps as artifacts, which any signed-in GitHub user could download because the repo is public. The latest backup was saved locally (outside the repo), all artifacts were deleted and the workflow was removed.

1. The daily keep-alive is now the Vercel cron `/api/internal/keep-alive` (one small `form_settings` read, authorised with `CRON_SECRET`).
2. Backups are manual from now on: `pg_dump` and `aws s3 sync` run locally into a folder outside the repo. Never upload dumps to GitHub.
3. Delete the now-unused repository secrets: `SUPABASE_DB_URL` and the four `SUPABASE_S3_*` values. Revoke the S3 access key in Supabase.

Before Phase 1, take a fresh manual backup of the database and all 5 buckets, and archive the TASi-App data (a `pg_dump --data-only` of the app tables plus the `chat-attachments` files). Store it with the CSR records, not in the repo (it holds personal data).

## Phase 1: Remove TASi-App objects (PR 2)

1. Write `supabase/migrations/<timestamp>_remove_tasi_app.sql`, in this order:
   1. Drop the two triggers on `event_registrations`. **This must come first**: Postgres does not track function bodies as dependencies, so dropping the tables first would leave these triggers in place and every registration insert or update would fail.
   2. Drop the app trigger functions.
   3. Remove the app tables from the `supabase_realtime` publication.
   4. Drop the views, then the tables.
   5. Drop `clerk_user_id` and `clerk_role` if `pg_policies` no longer references them.
2. Update `supabase/schema.sql` to match.
3. Before applying, re-run the dependency checks (functions, views and policies that mention the dropped objects) to catch anything new.
4. Apply the migration. Straight after:
   - change a registration's status in the admin console,
   - create a spot registration,
   - issue a pass and open its QR image,
   - open a certificate and its verify page.
5. By hand in the dashboard: delete the `push-fanout` Edge Function, the `chat-attachments` bucket and the app Vault secrets. If nothing else uses it, remove the Clerk third-party auth integration (the website uses the service role key, not Clerk JWTs).
6. Leave it a few days before Phase 2.

Rollback: restore the dropped objects from the Phase 0 dump or from the TASi-App repo migrations.

## Phase 2: Move to Mumbai

Do this on a quiet weekday. Expect about an hour with the admin console read-only.

### Prepare (no downtime)

1. Create a new free project in `ap-south-1` under the TASI org. Enable the same extensions (`pg_net`, `pgcrypto`, `pg_trgm`, `uuid-ossp`, `pg_stat_statements`).
2. Create the 4 remaining buckets with the same public/private settings and file limits.
3. Recreate any Vault secrets the website still needs.
4. Do a trial restore of the schema and data from a fresh dump. Fix errors; then empty the new database again.

### Cutover

1. Tell the team the admin console is paused. Nothing should write to the database during the copy.
2. Dump the Seoul database (`pg_dump` 17, schema and data, `--no-owner --no-privileges`) and restore it into Mumbai.
3. Copy the storage buckets with `aws s3 sync`. Run `aws configure set default.s3.preferred_transfer_client classic` first: Supabase storage rejects the default CRT client's ranged downloads.
4. Compare row counts per table and file counts per bucket.
5. In Vercel, update `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (and `NEXT_PUBLIC_SUPABASE_URL` if set) for Production and Preview.
6. In Vercel, change the function region from `icn1` to `bom1` (Mumbai).
7. Redeploy and run the Phase 1 checks again, plus the blog, forms and the certificate claim flow.

### Afterwards

1. Check the next run of the `/api/internal/keep-alive` cron in the Vercel logs, so the new project stays awake.
2. Update `.env.local`, `.vscode/mcp.json`, and relink the Supabase CLI.
3. Update the region notes in docs and memory.
4. Pause (do not delete) the Seoul project for 30 days as a fallback, then delete it.

### Known effects

- QR pass images already emailed point at the Seoul project's public URL. They stop loading once Seoul is paused. The event is over, so this is accepted.
- Any installed copy of TASi-App stops working. Accepted.

Rollback during Phase 2: put the Seoul env values and `icn1` back in Vercel and redeploy. Seoul is untouched until it is paused.
