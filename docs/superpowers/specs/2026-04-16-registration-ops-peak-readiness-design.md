# Registration Ops Peak Readiness Design

## Goal

Make the registration system, QR delivery pipeline, and related email workflows safe for peak event operations by moving expensive side effects off the synchronous request path, enforcing queue-backed bulk delivery, and making background processing reliable enough for `1,000+` registrations and pre-event QR sends.

## Current Context

The current codebase already has several useful foundations:

- public registration writes through server-side Supabase admin code
- rate limiting exists for public endpoints
- QR delivery already has queue-oriented job tables and admin UI support
- duplicate payment confirmation behavior is considered in tests

The main weaknesses are architectural rather than functional:

- registration submission still performs storage upload, database side effects, and confirmation email work in one request
- QR delivery has a queue-backed path, but bulk sends can still fall back to inline direct-send mode if queue infrastructure is missing
- email and asset generation work remains tightly coupled to request latency in several routes
- there is little runtime proof of burst handling for the critical registration and delivery paths

## Traffic Assumptions

- Ticketing traffic is expected to stay low to moderate and is out of scope for this hardening effort.
- Registration traffic is expected to exceed `1,000` total submissions.
- The most operationally sensitive load event is the pre-event QR and email push to confirmed attendees.
- Fast completion is preferred, but spreading deliveries over several minutes is acceptable.

## Success Criteria

The system is considered ready when:

- public registration requests return without waiting on non-essential outbound email work
- QR bulk delivery never processes inline for large batches
- queue-backed delivery can progress without requiring an admin page to remain open
- failed QR/email items are retryable without manual row surgery
- operators can observe queued, processing, sent, skipped, and failed states
- missing queue infrastructure causes a clear failure for bulk delivery instead of a silent direct-send fallback
- the system can process `1,000+` confirmed-attendee delivery items through bounded chunks with retries and visible progress

## Chosen Approach

Use a durable database-backed job pipeline.

The database remains the source of truth for background work. Public routes should persist core business state first, enqueue follow-up work second, and return. Background processors should claim small batches atomically, perform expensive work, record item outcomes, and refresh aggregate job state.

This approach fits the existing architecture, requires less platform churn than introducing an external queue, and is sufficient for the expected scale when paired with chunking, retries, and operational visibility.

## Architecture

### 1. Request-path minimization

Public routes should do the minimum necessary synchronous work:

- validate input
- persist the authoritative record
- enqueue background work if needed
- return a response

For registration, the synchronous path may still need to upload the attendee image because the registration record depends on that asset. But confirmation email sending and related notification side effects should no longer block the response.

### 2. Queue-backed side effects

All expensive or burst-prone side effects should run through job items:

- registration confirmation emails
- QR pass issuance and delivery
- resend/retry delivery actions
- similar operator-triggered outbound email workflows

Each job type should support:

- durable job row
- durable item rows
- chunked claiming
- bounded retries
- failure reason capture
- operator-visible progress

### 3. Bulk delivery must be queue-only

Bulk QR delivery should never degrade into inline processing when queue infrastructure is missing.

Current compatibility fallback behavior is acceptable only for very small legacy environments, but it is unsafe for peak-event readiness. For this design, any bulk send path must fail fast with an explicit operator-facing error if queue tables or job plumbing are unavailable.

### 4. Background progression

Queue processing must continue without depending on the delivery dashboard remaining open in a browser tab.

The preferred model is:

- keep the existing HTTP processing endpoints
- add a server-side trigger path for continued processing
- allow scheduled or explicit repeated processing until the queue drains

The admin UI can still poll and manually trigger processing, but it should no longer be the only engine advancing jobs.

## Data Model Direction

### Existing queue tables

The current QR pipeline already references:

- `pass_issue_email_jobs`
- `pass_issue_email_job_items`

These should be completed and treated as required infrastructure, not optional enhancements.

### Additional queue support

Registration confirmation mail should adopt the same durable pattern instead of being sent inline from the public registration route.

This can be implemented either by:

- reusing the existing queue model with a broader job type concept, or
- adding a dedicated registration-email job pair

The preferred implementation should minimize duplication while keeping item semantics easy to reason about.

## Processing Model

### Chunk size

Small bounded chunks are preferred over large batches. The current default chunk size of `20` items is a reasonable starting point for QR delivery because each item may require:

- pass issuance
- PDF generation
- QR image generation/upload
- email delivery

Chunk size should remain configurable so it can be tuned after observing real runtime behavior.

### Retry behavior

Every item should track:

- attempt count
- maximum attempts
- last attempt timestamp
- failure reason

Retries should be capped and visible. Permanent failures should remain in the queue for operator review and retry.

### Idempotency expectations

Processors must be safe to run repeatedly.

For QR delivery:

- if a pass already exists and resend mode is disabled, the item should skip cleanly
- if a pass already exists and resend mode is enabled, the system may reuse the existing pass while resending the delivery
- duplicate worker invocations should not create multiple valid passes for the same attendee

## Registration Path Changes

### Current issue

The registration route currently performs:

- multipart parsing
- image validation
- storage upload
- registration insert
- notification insert
- confirmation email delivery

in a single request.

### Target behavior

The registration route should:

1. validate and upload required image data
2. create the registration
3. enqueue confirmation email work
4. return success without waiting for outbound delivery

This reduces tail latency and isolates email provider delays from public submission success.

## QR Delivery Changes

### Current issue

The QR pipeline is close to the right shape but still has two operational gaps:

- direct-send fallback if queue tables are unavailable
- processing cadence relies too heavily on UI-driven polling

### Target behavior

The QR pipeline should:

1. require queue infrastructure for bulk sends
2. create durable jobs and item rows
3. process items in bounded chunks
4. continue processing until drained through server-side progression
5. expose job and item state clearly to operators

## Email Delivery Changes

### Registration confirmation email

Move to queued delivery.

The public registration request should no longer wait on Resend.

### QR pass issued email

Remain queue-backed, with improved guarantees:

- no inline bulk compatibility mode
- explicit retry visibility
- bounded chunk processing
- continued execution without UI dependency

### Similar outbound workflows

Any other operator-triggered delivery that can fan out across many attendees should use the same durable pattern rather than bespoke inline sends.

## Observability and Operations

Operators need clear answers to these questions:

- how many items are queued right now
- how many are processing
- how many were sent
- how many were skipped
- how many failed
- whether the queue infrastructure is healthy
- whether processing is advancing

The current delivery jobs panel is a good base and should remain the primary inspection surface. It should surface hard failures when background infrastructure is unavailable.

## Failure Handling

### Queue infrastructure missing

For bulk send operations:

- return a clear error
- do not direct-send inline
- tell the operator exactly what infrastructure is missing

### Individual item failures

Do not fail the whole job because one attendee fails.

Instead:

- mark the item as retrying or failed
- continue processing other items in the chunk
- refresh aggregate job counters

### Provider slowness

Slow email or asset operations should degrade throughput, not correctness. Chunking and retries are the safety valve.

## Testing Strategy

This hardening work needs more than happy-path unit tests.

Required coverage should include:

- registration route returns success without inline email send
- queued registration email items are created correctly
- bulk QR job creation fails clearly when queue infrastructure is missing
- job processors claim only bounded chunks
- retries and failure transitions behave correctly
- duplicate processing does not duplicate passes
- job completion state is accurate after mixed sent/skipped/failed items

Where practical, add integration-style tests around job processors and route behavior, not just isolated helper logic.

## Rollout Strategy

Implement in this order:

1. make queue infrastructure mandatory for bulk QR delivery
2. move registration confirmation email off the request path
3. harden server-side QR job processing and retries
4. add verification and operational checks

This order reduces the biggest event-day risks first.

## Out of Scope

- ticketing throughput hardening
- replacing Supabase with an external queue platform
- distributed multi-region worker orchestration
- redesigning unrelated admin UI workflows

## Recommended Outcome

After this change set, the system should no longer depend on long synchronous request chains for registration and bulk QR delivery. Public registration should remain responsive under moderate burst conditions, and the one-week-before attendee communication push should run as a durable chunked queue workflow that can safely process `1,000+` recipients over several minutes with retry visibility.
