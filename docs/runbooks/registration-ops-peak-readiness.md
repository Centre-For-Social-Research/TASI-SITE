# Registration Ops Peak Readiness Runbook

## Purpose

Operate registration confirmation mail and pre-event QR delivery in queue-backed mode so public traffic stays responsive and bulk sends drain safely over bounded background chunks.

## Preconditions

- Supabase queue tables exist:
  - `pass_issue_email_jobs`
  - `pass_issue_email_job_items`
  - `registration_email_jobs`
  - `registration_email_job_items`
- `REGISTRATION_JOB_PROCESSOR_SECRET` is configured for server-to-server processing calls if you do not want to depend on an open admin session.
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

This second mode is intended for cron or server-to-server triggers.

## How to confirm queue-backed mode is active

1. Open the delivery jobs interface for QR sends.
2. Confirm you do not see the direct-send compatibility warning.
3. Trigger a small batch and verify job rows and item rows are created.
4. Confirm processing advances in chunks instead of trying to complete the full batch in one request.

## Recommended dry run

Before the full pre-event send:

1. Process a test cohort of `25-50` confirmed attendees.
2. Watch queue counts move from `queued` to `processing` to `sent`.
3. Confirm failed items capture actionable `failure_reason` values.
4. Confirm retries only target failed items.

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
