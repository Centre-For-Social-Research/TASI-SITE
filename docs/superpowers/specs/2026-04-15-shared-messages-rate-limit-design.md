# Shared Messages Rate Limit Design

Date: 2026-04-15
Scope: Shared `/api/messages` route and all UI surfaces that post to it

## Goal

Reduce abuse against the shared contact-message pipeline by tightening rate limiting on `/api/messages`, surfacing a clear user-facing throttle message in all forms that use it, and then verifying the shared message flow for regressions.

## Current Context

The exhibition enquiry form and the footer quick-message form both submit to `/api/messages`.

The shared route already uses `protectPublicPostRoute()` from `src/lib/api-security.js`, with a current limit of 5 requests per 10 minutes per IP. That means the application already has rate-limit infrastructure, but the threshold is relatively permissive for a public inbound-message endpoint.

The route currently stores all inbound messages with `source: 'site-footer'`, even when the request comes from the exhibition enquiry form. That is not part of the explicit user request, but it is a likely correctness bug in the shared message pipeline and should be reviewed during the regression pass.

## Chosen Direction

Tighten the shared `/api/messages` route to 3 requests per 15 minutes per IP for every public client that uses it.

This keeps the implementation aligned with existing architecture:

- One shared server-side rate limit on the route, not duplicated per component.
- Existing `protectPublicPostRoute()` logic remains the enforcement layer.
- Client forms continue posting to the same endpoint and simply display the route's error response when throttled.

## Behavioral Changes

### Rate limit

- Apply a stricter shared limit of 3 requests per 15 minutes on `/api/messages`.
- Keep enforcement server-side only.
- Preserve the standard `429` JSON error response shape so clients can render the message directly.

### Client feedback

- Ensure both the exhibition enquiry form and footer quick-message flow display the returned throttle message cleanly when the route responds with `429`.
- No new client-side cooldown timers or lockouts are required.

### Regression/bug review

After adding the tighter limit, verify the shared message flow for obvious correctness issues and fix anything directly related to the route or its known callers.

This review should include:

- request validation
- successful submission behavior
- non-JSON response handling
- 429 handling in both UI callers
- route metadata correctness, including the stored `source` value if it is clearly wrong for shared submissions

## Implementation Shape

Likely files:

- `src/app/api/messages/route.js`
- `src/components/exhibition/exhibition-enquiry-form.jsx`
- `src/components/ui/footer-section.tsx`
- `tests/exhibition-page.test.cjs`
- one or more new tests for `/api/messages` route behavior if the repo already has a suitable pattern for route-level tests

## Testing Strategy

Use TDD.

At minimum:

- Add or update tests to prove the shared route uses the stricter limit configuration.
- Verify both existing message-submit clients still target `/api/messages`.
- Verify the exhibition form still shows the expected success message and can surface route errors.
- Run targeted tests first, then run the full suite.

## Out of Scope

- CAPTCHA or bot-detection services
- per-user authenticated rate limits
- new anti-spam vendors
- redesigning either form
- changing unrelated API routes
