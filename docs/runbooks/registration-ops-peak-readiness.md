# Registration Ops Peak Readiness Runbook

## Purpose

Operate registration confirmation mail and pre-event QR delivery in queue-backed mode so public traffic stays responsive and bulk sends drain safely over bounded background chunks.

## Preconditions

- Supabase queue tables exist:
  - `pass_issue_email_jobs`
  - `pass_issue_email_job_items`
  - `registration_email_jobs`
  - `registration_email_job_items`
- Apply `supabase/migrations/20260927195730_serialize_registration_email_job_refresh.sql` before deploying the matching application code. The code calls this function while queueing each registration email; deploying code first would leave a saved status with an email job that could not finish queue setup.
- `REGISTRATION_JOB_PROCESSOR_SECRET` is configured for server-to-server processing calls if you do not want to depend on an open admin session.
- `CRON_SECRET` is configured so Vercel Cron can authenticate the scheduled queue drain route.
- Resend and Supabase credentials are configured correctly.

## Registration confirmation behavior

- Public registration submission should return after saving the registration and enqueueing confirmation mail.
- It should not wait on outbound email delivery.
- If the registration email queue is unavailable, the submission should still save, but the response should indicate that confirmation mail was not queued.

## Bulk QR delivery behavior

- Bulk QR sends must be queue-backed.
- If QR queue tables are unavailable, the action must fail with a clear operator error.
- Bulk QR sends must not fall back to inline direct-send mode.

## Processing routes

### Scheduled drain route

`GET /api/internal/registration-ops/drain`

- Configured as one daily invocation at 00:00 UTC (`0 0 * * *`) in `vercel.json`. Vercel Hobby permits each cron job to run once per day.
- Authenticated with `Authorization: Bearer <CRON_SECRET>`
- Drains both QR and registration email queues in bounded passes per invocation
- Provides a daily backup drain when no admin page is open; it does not provide minute-by-minute processing
- Automatic queue selection starts with jobs created at or after 2026-09-28 00:00 IST. Earlier jobs remain in the read-only Email job archive and are excluded from automatic processing while the pre-event backlog is reviewed. An explicit process or retry request with an old job ID is still possible and must be treated as a deliberate operator action.
- Retrying an older job only resets failed items to queued; the automatic drain still excludes it. An operator must then explicitly process that job ID to send it.
- A status save triggers the specific job it just queued. The backup drain chooses the oldest eligible job by checking its actual queued or retrying items, even if the initial queue or retry counter refresh failed. Job counters are refreshed in one database transaction while holding the job row lock.

### Process QR delivery chunks

`POST /api/admin/passes/jobs/process`

Optional JSON body:

```json
{
  "jobId": "<optional-job-id>",
  "chunkSize": 20
}
```

### Process registration email chunks

`POST /api/admin/email-jobs/process`

Optional JSON body:

```json
{
  "jobId": "<optional-job-id>",
  "chunkSize": 20
}
```

## Authentication

Either:

- call the routes from an authorized operator session, or
- send `x-registration-job-secret: <REGISTRATION_JOB_PROCESSOR_SECRET>`
- let Vercel Cron call the scheduled drain route with `Authorization: Bearer <CRON_SECRET>`

This second mode is intended for cron or server-to-server triggers.

## How to confirm queue-backed mode is active

1. Open the delivery jobs interface for QR sends.
2. Confirm you do not see the direct-send compatibility warning.
3. Trigger a small batch and verify job rows and item rows are created.
4. Confirm processing advances in chunks instead of trying to complete the full batch in one request.
5. In Outgoing Emails, use All outgoing emails for provider-accepted messages and Email job archive for queued or failed local attempts. Neither provider acceptance nor a job marked sent proves inbox arrival.

## Recommended dry run

Before the full pre-event send:

1. Process a test cohort of `25-50` confirmed attendees.
2. Watch queue counts move from `queued` to `processing` to `sent`.
3. Confirm failed items capture actionable `failure_reason` values.
4. Confirm retries only target failed items.
5. In preview, trigger the same new job from two workers and verify one email attempt and final counters. Confirm a processing-only job does not block another eligible job.

## Operational checks during the 1,000+ attendee push

- queued count is steadily decreasing
- sent count is steadily increasing
- failure count remains bounded
- no route is returning unexpected `500`s
- Resend throughput remains healthy
- no one is using a manual resend path as a substitute for the queue

## Failure response

- If queue infrastructure is missing: stop bulk send operations and deploy the missing tables first.
- If only a subset of items fail: retry failed items after reviewing provider or asset errors.
- If processing stalls: call the processing route directly with the shared secret and a bounded `chunkSize`.
