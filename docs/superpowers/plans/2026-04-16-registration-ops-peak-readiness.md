# Registration Ops Peak Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make registration submission, QR delivery, and related email workflows resilient for peak event operations by removing inline outbound delivery from hot public paths and enforcing durable queue-backed bulk processing.

**Architecture:** Keep Supabase as the system of record, move expensive email side effects behind database-backed jobs, and make queue-backed QR delivery mandatory for bulk sends. Preserve the existing admin jobs UX, but harden the backend so processing can advance safely in bounded chunks and bulk sends fail loudly when queue infrastructure is unavailable.

**Tech Stack:** Next.js App Router, Supabase, Resend, Node test runner

---

### Task 1: Add a reusable queue hard-fail guard and tests

**Files:**
- Modify: `src/lib/registration-job-utils.cjs`
- Test: `tests/registration-job-utils.test.cjs`

- [ ] **Step 1: Write the failing test**

```javascript
test('assertQueueInfrastructureAvailable throws a clear operator-facing error for bulk work when queue tables are unavailable', async () => {
  const { assertQueueInfrastructureAvailable } = await importModule(
    'src/lib/registration-job-utils.cjs'
  );

  assert.throws(
    () =>
      assertQueueInfrastructureAvailable(
        new Error('relation "pass_issue_email_jobs" does not exist'),
        'QR bulk delivery queue is unavailable.'
      ),
    /QR bulk delivery queue is unavailable/i
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c node --test tests\\registration-job-utils.test.cjs`
Expected: FAIL because `assertQueueInfrastructureAvailable` is not defined

- [ ] **Step 3: Write minimal implementation**

```javascript
function assertQueueInfrastructureAvailable(
  errorOrMessage,
  message = 'Queue infrastructure is unavailable.'
) {
  if (isQueueInfrastructureUnavailable(errorOrMessage)) {
    throw new Error(message);
  }

  throw errorOrMessage instanceof Error
    ? errorOrMessage
    : new Error(String(errorOrMessage || message));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cmd /c node --test tests\\registration-job-utils.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/registration-job-utils.test.cjs src/lib/registration-job-utils.cjs
git commit -m "test: add queue guard helper"
```

### Task 2: Remove bulk QR direct-send fallback and fail clearly

**Files:**
- Modify: `src/lib/pass-issue-job-service.js`
- Test: `tests/pass-issue-job-service.test.cjs`

- [ ] **Step 1: Write the failing test**

```javascript
test('createPassIssueEmailJob fails clearly instead of direct-sending when queue tables are unavailable', async () => {
  const service = await importModule('src/lib/pass-issue-job-service.js');

  await assert.rejects(
    () =>
      service.createPassIssueEmailJob({
        operator: { userId: 'op-1', primaryEmail: 'ops@example.com' },
      }),
    /queue-backed qr delivery is required/i
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c node --test tests\\pass-issue-job-service.test.cjs`
Expected: FAIL because current code falls back to `legacyDirect`

- [ ] **Step 3: Write minimal implementation**

Replace the `catch` block in `createPassIssueEmailJob()` so queue failures call the new hard-fail helper instead of iterating through inline direct delivery:

```javascript
  } catch (error) {
    assertQueueInfrastructureAvailable(
      error,
      'Queue-backed QR delivery is required for bulk sends. Deploy the QR job tables before running this action.'
    );
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cmd /c node --test tests\\pass-issue-job-service.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/pass-issue-job-service.test.cjs src/lib/pass-issue-job-service.js
git commit -m "feat: require queue-backed qr delivery"
```

### Task 3: Move registration confirmation email off the public request path

**Files:**
- Modify: `src/app/api/registrations/create/route.js`
- Modify: `src/lib/registration-email.js`
- Create: `src/lib/registration-email-job-service.js`
- Modify: `src/lib/registration-ops-db.js`
- Test: `tests/registration-create-route.test.cjs`

- [ ] **Step 1: Write the failing test**

```javascript
test('registration create route returns success after enqueueing confirmation mail without calling inline delivery', async () => {
  const { POST } = await importRoute('src/app/api/registrations/create/route.js', {
    deliverRegistrationEmail: async () => {
      throw new Error('inline delivery should not run');
    },
  });

  const response = await POST(buildRegistrationRequest());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.emailQueued, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c node --test tests\\registration-create-route.test.cjs`
Expected: FAIL because the route still calls inline `deliverRegistrationEmail`

- [ ] **Step 3: Write minimal implementation**

Create a queue service that:

- creates a durable email job record/item for `submission_received`
- returns a queued result for the route

Then update the route to replace:

```javascript
    const emailResult = await deliverRegistrationEmail({
      registration: createdRegistration,
      templateType: 'submission_received',
      notificationId,
      db: { markNotificationDelivery },
    });
```

with:

```javascript
    const emailResult = await queueRegistrationEmailJob({
      registrationId: createdRegistration.id,
      templateType: 'submission_received',
      notificationId,
    });
```

and make the response derive `emailQueued` from job enqueue success instead of inline delivery success.

- [ ] **Step 4: Run test to verify it passes**

Run: `cmd /c node --test tests\\registration-create-route.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/registration-create-route.test.cjs src/app/api/registrations/create/route.js src/lib/registration-email-job-service.js src/lib/registration-email.js src/lib/registration-ops-db.js
git commit -m "feat: queue registration confirmation emails"
```

### Task 4: Add durable registration email job storage and processing

**Files:**
- Modify: `src/lib/registration-ops-db.js`
- Create: `src/lib/registration-email-job-service.js`
- Create: `src/app/api/admin/email-jobs/process/route.js`
- Test: `tests/registration-email-job-service.test.cjs`

- [ ] **Step 1: Write the failing test**

```javascript
test('processRegistrationEmailJob sends one queued confirmation item and marks it sent', async () => {
  const service = await importModule('src/lib/registration-email-job-service.js');
  const result = await service.processNextAvailableRegistrationEmailJob({
    operator: { userId: 'op-1', primaryEmail: 'ops@example.com' },
  });

  assert.equal(result.status, 'completed');
  assert.equal(result.sent_items, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c node --test tests\\registration-email-job-service.test.cjs`
Expected: FAIL because the service and durable job functions do not exist

- [ ] **Step 3: Write minimal implementation**

Add registration email job helpers parallel to the QR job helpers:

- create job
- insert job items
- claim queued items in bounded chunks
- update item status
- refresh job counters
- process one chunk using `deliverRegistrationEmail`

Expose a small authenticated processing route:

```javascript
export async function POST() {
  // require operator
  // process next available registration email job
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cmd /c node --test tests\\registration-email-job-service.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/registration-email-job-service.test.cjs src/lib/registration-email-job-service.js src/lib/registration-ops-db.js src/app/api/admin/email-jobs/process/route.js
git commit -m "feat: add registration email jobs"
```

### Task 5: Make background job processing continue server-side

**Files:**
- Modify: `src/components/admin/delivery-jobs-panel.jsx`
- Modify: `src/app/api/admin/passes/jobs/process/route.js`
- Modify: `src/app/api/admin/email-jobs/process/route.js`
- Test: `tests/delivery-jobs-panel.test.cjs`

- [ ] **Step 1: Write the failing test**

```javascript
test('delivery jobs panel surfaces queue-unavailable bulk-send errors and continues polling active jobs', async () => {
  const source = readSource('src/components/admin/delivery-jobs-panel.jsx');
  assert.match(source, /queueUnavailable/);
  assert.match(source, /setInterval/);
  assert.match(source, /Unable to process QR delivery job right now/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c node --test tests\\delivery-jobs-panel.test.cjs`
Expected: FAIL if the new registration-email processing/polling hooks are not present

- [ ] **Step 3: Write minimal implementation**

Extend the server-side processing routes so they can be triggered independently of user interaction and return structured status. Keep client polling as a control surface, but make it operate against routes that are safe to call repeatedly and that can drain jobs chunk-by-chunk.

If you add a registration email jobs panel later, keep the same process model:

- server route processes one bounded chunk
- repeated calls continue draining
- UI only observes and nudges

- [ ] **Step 4: Run test to verify it passes**

Run: `cmd /c node --test tests\\delivery-jobs-panel.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/delivery-jobs-panel.test.cjs src/components/admin/delivery-jobs-panel.jsx src/app/api/admin/passes/jobs/process/route.js src/app/api/admin/email-jobs/process/route.js
git commit -m "feat: harden background job processing"
```

### Task 6: Verify the peak-readiness changes end-to-end

**Files:**
- Modify: `docs/runbooks/messages-production-load-test.md`
- Create: `docs/runbooks/registration-ops-peak-readiness.md`

- [ ] **Step 1: Add operator runbook coverage**

Document:

- required queue tables
- how to confirm queue-backed mode is active
- how to create and monitor a QR batch
- how to process/retry failed items
- how to validate registration confirmation email jobs

- [ ] **Step 2: Run the targeted verification suite**

Run: `cmd /c node --test tests\\registration-job-utils.test.cjs tests\\pass-issue-job-service.test.cjs tests\\registration-create-route.test.cjs tests\\registration-email-job-service.test.cjs tests\\delivery-jobs-panel.test.cjs tests\\festival-payment-route-handlers.test.cjs`
Expected: PASS with `0` failures

- [ ] **Step 3: Commit**

```bash
git add docs/runbooks/registration-ops-peak-readiness.md docs/runbooks/messages-production-load-test.md tests/registration-job-utils.test.cjs tests/pass-issue-job-service.test.cjs tests/registration-create-route.test.cjs tests/registration-email-job-service.test.cjs tests/delivery-jobs-panel.test.cjs
git commit -m "docs: add registration ops readiness runbook"
```
