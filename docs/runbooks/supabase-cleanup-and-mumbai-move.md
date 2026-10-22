# Supabase cleanup and move to Mumbai

Done 2026-10-22 to 2026-10-23, after TASI 2026. This page records what was done and what to remember for the next move or restore.

| Phase | What                                                        | Status                |
| ----- | ----------------------------------------------------------- | --------------------- |
| 0     | Stop public backup artifacts, move the keep-alive to Vercel | Done (#150)           |
| 1     | Remove the TASi-App objects from the shared project         | Done (#152)           |
| 2     | Move the database from Seoul to Mumbai                      | Done                  |
| 3     | Retire the Seoul project                                    | After about two weeks |

## Projects

|                        | Before                                                       | Now                                                          |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Supabase project       | `TASI-SITE` (`ttkqwqayvfwiwfszaqzk`), Seoul `ap-northeast-2` | `TASI-WEBSITE` (`fhhovnddmygnyelmhaex`), Mumbai `ap-south-1` |
| Vercel function region | `icn1`                                                       | `bom1`                                                       |

The website reaches Supabase only through `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server side). The function region is a Vercel dashboard setting (Project → Settings → Functions), not in the repo. Keep it in the same region as the database: admin pages make many sequential queries.

## Phase 0: Backups and keep-alive

The GitHub backup workflow uploaded unencrypted database dumps as artifacts, which any signed-in GitHub user could download because the repo is public. The artifacts were deleted and the workflow removed.

- The daily keep-alive is the Vercel cron `/api/internal/keep-alive` (one small `form_settings` read, authorised with `CRON_SECRET`).
- Backups are manual and local: `pg_dump` into a folder outside the repo. Never upload dumps to GitHub.

## Phase 1: Remove TASi-App objects

Migration `supabase/migrations/20261022165816_remove_tasi_app.sql` dropped 18 app tables, 2 views, 16 functions, the app triggers and policy on `event_registrations`, the chat storage policies and the push Vault secrets. The `chat-attachments` bucket and the `push-fanout` Edge Function were deleted by hand.

- The two app triggers on `event_registrations` had to go first. Postgres does not track function bodies as dependencies, so dropping the tables first would have broken every registration insert and update.
- `app_idempotency_keys` stays: the website uses it despite the prefix.
- The migration was rehearsed on production inside a `do` block that ends with `raise exception`, so everything rolled back, before it was applied.

## Phase 2: Move to Mumbai

The site kept running on Seoul until the Vercel switch, so there was no downtime.

1. **Tools.** PostgreSQL 17 command-line tools from the EnterpriseDB Windows binaries zip (no installer, no Docker). `pg_dump` must be at least the server's major version.
2. **New project.** Created in the TASI org, `ap-south-1`, with "Automatically expose new tables" off and automatic RLS on. Project names must be unique within an organisation.
3. **Connections.** Use the direct connection (`db.<ref>.supabase.co:5432`, user `postgres`). Right after a password reset, the session pooler can keep rejecting the new password for a while.
4. **Database.** `pg_dump --schema=public --no-owner` and `pg_dump --schema=supabase_migrations --no-owner`, restored with `psql -v ON_ERROR_STOP=1 --single-transaction`. Before restoring:
   - enable `pg_trgm` in the `extensions` schema (the search indexes use it),
   - drop `CREATE SCHEMA public`, `COMMENT ON SCHEMA public` and every `ALTER DEFAULT PRIVILEGES` line from the dump.
     `pg_net` was not carried over; nothing uses it since Phase 1.
5. **Permissions.** `pg_dump` writes table grants relative to the standard Postgres baseline, not Supabase's defaults, so 20 tables picked up minor `anon`/`authenticated` rights from the new project's defaults. They were revoked to match Seoul exactly. Also revoke `EXECUTE` on `public.rls_auto_enable()` from `anon` and `authenticated` (Supabase's automatic-RLS helper; the security advisor flags it).
6. **Storage.** A Node script using `@supabase/supabase-js` and each project's service-role key listed every bucket, created missing buckets with the same settings, and copied files one by one (1,446 files, about an hour). No S3 keys were needed.
7. **Verification.** Compared both databases with the same queries: exact row counts per table, RLS flags, table and function grants, function, policy, trigger, index, view and constraint definitions, column definitions, sequence values and migration history. Compared every storage object's path, size and MIME type, and the Data API settings (exposed schemas, max rows) in the dashboard. Everything matched apart from `pg_net` and Supabase's own newer defaults.
8. **Switch.** In Vercel: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Production and Preview, function region to `bom1`, then redeploy without the build cache. Confirmed through the Mumbai API logs that the site queries the new project.

Certificate session cookies are signed from the service-role key unless `CERTIFICATE_SESSION_SECRET` is set, so a key change logs out certificate sessions (at most two hours). Emailed certificate links keep working.

## Phase 3: Retire Seoul

1. Leave Seoul untouched for about two weeks as a fallback. To roll back, use Vercel's Instant Rollback to a deployment from before the switch.
2. Then pause the Seoul project, and delete it later.
3. Rename `TASI-WEBSITE` to `TASI-SITE` afterwards if wanted.

Known effects: QR pass images in emails sent before the move link to the Seoul project's public URL, so they stop loading once Seoul is paused (`/my-pass` builds the link from the current project and keeps working). Any installed copy of TASi-App has stopped working.
