# Production `/api/messages` Load Test Design

Date: 2026-04-15
Scope: Production-safe load testing for `POST /api/messages`

## Goal

Validate that the production `/api/messages` endpoint handles repeated public form traffic safely by enforcing the existing per-IP rate limit, while keeping database writes and downstream notification side effects to a minimum.

## Chosen Direction

Run a single-origin production probe using `k6` at `5 RPS` for `5 minutes`.

This is intentionally not a write-throughput test. It is a protection-behavior test.

The test should confirm:

- a small number of initial requests may succeed with `200`
- sustained traffic quickly transitions to `429`
- valid payloads do not produce `400`
- the route does not produce `500`
- Supabase receives only a small number of actual `contact_messages` inserts

## Why This Approach

The `/api/messages` route is a write endpoint that persists contact submissions and triggers notification email attempts after successful inserts.

A production-safe first test should:

- validate rate limiting rather than bypassing it
- avoid generating a large number of stored contact rows
- avoid turning production into a noisy synthetic-submission stream
- still exercise the real app, edge, and Supabase path under controlled conditions

## Traffic Profile

- Target: production `POST /api/messages`
- Origin: single test runner IP
- Rate: `5 requests per second`
- Duration: `5 minutes`
- Payload: valid synthetic payload with a distinct test `source` tag

Because the route currently limits requests to `3` per `15` minutes per IP, the expected behavior is that most requests after the first small burst are rejected with `429`.

## Payload Strategy

Use valid payloads so the endpoint reaches its actual abuse-protection path rather than failing input validation.

Payload shape:

- `email`: controlled test email value
- `message`: valid synthetic message longer than `10` characters
- `source`: distinct load-test identifier such as `k6-production-messages`

## Success Criteria

- `200` responses are limited to the first few allowed submissions from the runner IP
- `429` responses become the dominant steady-state outcome
- `400` responses remain at `0`
- `500` responses remain at `0`
- latency remains stable enough that the endpoint is rejecting traffic quickly rather than failing under load
- Supabase API logs show only a small number of `POST /rest/v1/contact_messages` writes during the run window

## Monitoring Plan

### K6 metrics

Capture:

- request count
- status-code distribution
- latency percentiles
- checks for expected `200` and `429` behavior

### Supabase monitoring

Use Supabase API logs to inspect:

- `POST /rest/v1/contact_messages`
- timestamps during the run window
- count of successful insert traffic reaching the database

This gives a direct way to confirm that rate limiting is preventing write amplification.

## Safety Constraints

- production only for this scoped endpoint
- no payment, ticketing, or registration routes
- no distributed IP strategy
- no attempts to evade the rate limiter
- no large-scale synthetic database writes
- stop immediately if unexpected `500`s or operational issues appear

## Implementation Notes

Likely implementation artifacts:

- a `k6` script in the repo for `/api/messages`
- a package script or documented command to run it
- a short runbook for correlating the test with Supabase logs

No application code changes are required for the first probe unless the user later wants more explicit observability markers.

## Out of Scope

- distributed multi-IP load generation
- bypassing rate limits
- load testing ticketing, registration, or payment endpoints
- destructive database stress testing
- production data cleanup automation
