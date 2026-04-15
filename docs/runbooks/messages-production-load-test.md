# `/api/messages` Production-Safe Load Test Runbook

## Purpose

Run a production-safe `k6` probe against `POST /api/messages` at `5 RPS` for `5 minutes` from a single origin and verify that the application rate limiter prevents a write storm into Supabase.

## Preconditions

- `k6` is installed on the runner machine.
- The production site URL is confirmed.
- You have access to Supabase API logs for the test window.
- You understand that a small number of real synthetic submissions may be created before the per-IP limiter takes over.

## Environment

Set the environment variables before running the test.

```powershell
$env:MESSAGES_BASE_URL = "https://<production-domain>"
$env:MESSAGES_TEST_EMAIL = "loadtest+tasi-messages@example.com"
$env:MESSAGES_TEST_SOURCE = "k6-production-messages"
```

Optional:

```powershell
$env:MESSAGES_TEST_MESSAGE = "Production-safe k6 probe for /api/messages. This synthetic payload validates rate limiting and should be throttled after the first few requests."
```

## Run

From the repo root:

```powershell
cmd /c npm run loadtest:messages:prod-safe
```

## Expected Application Behavior

- The first few requests may return `200`.
- The steady-state result should be dominated by `429`.
- `400` responses should stay at `0` because the payload is valid.
- `500` responses should stay at `0`.
- Latency should remain stable enough that the endpoint is rejecting quickly rather than degrading under load.

## Supabase Monitoring

During and after the run, inspect Supabase API logs for:

- `POST /rest/v1/contact_messages`
- timestamps that overlap the test window
- a low count of successful inserts consistent with the `3 requests per 15 minutes per IP` limiter

If inserts appear far above the expected small initial burst, stop and investigate the route protection before any stronger test.

## Stop Conditions

Stop immediately if:

- `500` responses appear
- application behavior looks inconsistent with the expected limiter behavior
- Supabase logs show an unexpectedly high insert volume
- any downstream operational issue appears

## What To Record

Capture:

- `k6` status code distribution
- `k6` latency summary
- start and end time of the run
- Supabase API log observations for `contact_messages` inserts

## Notes

- This is a protection-behavior test, not a throughput benchmark.
- Do not use a distributed IP strategy for this first run.
- Do not point this script at ticketing, registration, or payment endpoints.
