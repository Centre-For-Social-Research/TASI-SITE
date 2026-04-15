import http from 'k6/http';
import { check } from 'k6';

const baseUrl = __ENV.MESSAGES_BASE_URL;
const email =
  __ENV.MESSAGES_TEST_EMAIL || 'loadtest+tasi-messages@example.com';
const source = __ENV.MESSAGES_TEST_SOURCE || 'k6-production-messages';
const message =
  __ENV.MESSAGES_TEST_MESSAGE ||
  'Production-safe k6 probe for /api/messages. This synthetic payload validates rate limiting and should be throttled after the first few requests.';

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
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'max'],
};

function buildPayload() {
  return JSON.stringify({
    email,
    message,
    source,
  });
}

export default function () {
  const response = http.post(`${baseUrl}/api/messages`, buildPayload(), {
    headers: { 'Content-Type': 'application/json' },
    tags: {
      endpoint: 'messages',
      test_type: 'production_safe',
      source,
    },
  });

  check(response, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'no validation failures': (r) => r.status !== 400,
    'no server failures': (r) => r.status !== 500,
  });
}
