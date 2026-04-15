# Production `/api/messages` Load Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-safe `k6` load-test script and runbook for `/api/messages` so the endpoint can be probed at `5 RPS` for `5 minutes` from a single origin and correlated with Supabase monitoring.

**Architecture:** Keep this as tooling and documentation only. Add a dedicated `k6` script under a focused load-test directory, expose it through `package.json`, and document the exact production-safe execution and Supabase log review steps in a runbook. Do not change application runtime behavior.

**Tech Stack:** `k6`, Next.js app routes, npm scripts, Supabase API logs

---

### Task 1: Add the production-safe `k6` script and runbook

**Files:**
- Create: `load-tests/messages-production-safe.js`
- Create: `docs/runbooks/messages-production-load-test.md`
- Modify: `package.json`

- [ ] **Step 1: Add the load-test script entry to `package.json`**

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --max-warnings 0",
  "format": "prettier . --write",
  "format:check": "prettier . --check",
  "test": "node --test \"tests/*.test.cjs\"",
  "loadtest:messages:prod-safe": "k6 run load-tests/messages-production-safe.js"
}
```

- [ ] **Step 2: Write the `k6` script with the fixed single-IP `5 RPS` / `5m` scenario**

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.MESSAGES_BASE_URL;
const email = __ENV.MESSAGES_TEST_EMAIL || 'loadtest+tasi-messages@example.com';
const source = __ENV.MESSAGES_TEST_SOURCE || 'k6-production-messages';

if (!baseUrl) {
  throw new Error('MESSAGES_BASE_URL is required.');
}

export const options = {
  scenarios: {
    messages_rate_limit_probe: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 10,
      maxVUs: 20,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

function buildPayload() {
  return JSON.stringify({
    email,
    message:
      'Production-safe k6 probe for /api/messages. This synthetic payload is used to validate rate limiting and should be throttled after the first few requests.',
    source,
  });
}

export default function () {
  const response = http.post(`${baseUrl}/api/messages`, buildPayload(), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'messages', test_type: 'production_safe' },
  });

  check(response, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'no validation failures': (r) => r.status !== 400,
    'no server failures': (r) => r.status !== 500,
  });

  sleep(1);
}
```

- [ ] **Step 3: Add the production runbook with exact run and monitoring steps**

```md
# `/api/messages` Production-Safe Load Test Runbook

## Preconditions

- `k6` is installed on the runner machine
- production base URL is confirmed
- Supabase API logs are accessible during the test window

## Environment

```powershell
$env:MESSAGES_BASE_URL = "https://<production-domain>"
$env:MESSAGES_TEST_EMAIL = "loadtest+tasi-messages@example.com"
$env:MESSAGES_TEST_SOURCE = "k6-production-messages"
```

## Run

```powershell
cmd /c npm run loadtest:messages:prod-safe
```

## Expected behavior

- the first few requests may return `200`
- steady-state traffic should be mostly `429`
- `400` should remain `0`
- `500` should remain `0`

## Supabase checks

During and after the run, inspect API logs for:

- `POST /rest/v1/contact_messages`
- timestamps within the test window
- low insert count consistent with the `3 per 15 minutes per IP` limiter

Stop the test immediately if unexpected `500`s or operational issues appear.
```

- [ ] **Step 4: Verify repository wiring without running the live load test**

Run: `Get-Content package.json`
Expected: the new `loadtest:messages:prod-safe` script is present and points to `load-tests/messages-production-safe.js`.

- [ ] **Step 5: Confirm execution blocker status for this environment**

Run: `Get-Command k6`
Expected: command not found in the current environment, confirming that actual execution requires installing `k6` first.

- [ ] **Step 6: Commit**

```bash
git add package.json load-tests/messages-production-safe.js docs/runbooks/messages-production-load-test.md docs/superpowers/specs/2026-04-15-production-messages-load-test-design.md docs/superpowers/plans/2026-04-15-production-messages-load-test.md
git commit -m "chore: add production-safe messages load test"
```
