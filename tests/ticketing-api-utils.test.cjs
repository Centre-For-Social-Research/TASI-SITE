const test = require('node:test');
const assert = require('node:assert/strict');

test('serves demo ticket events in development when ticketing schema is missing', async () => {
  const { shouldServeDemoTicketEvents } =
    await import('../src/lib/ticketing-api-utils.js');

  assert.equal(
    shouldServeDemoTicketEvents({
      message:
        "Could not find the table 'public.ticket_events' in the schema cache",
      nodeEnv: 'development',
    }),
    true
  );
});

test('does not hide missing ticketing schema in production', async () => {
  const { shouldServeDemoTicketEvents } =
    await import('../src/lib/ticketing-api-utils.js');

  assert.equal(
    shouldServeDemoTicketEvents({
      message:
        "Could not find the table 'public.ticket_events' in the schema cache",
      nodeEnv: 'production',
    }),
    false
  );
});

test('serves demo ticket events when Supabase admin credentials are missing', async () => {
  const { shouldServeDemoTicketEvents } =
    await import('../src/lib/ticketing-api-utils.js');

  assert.equal(
    shouldServeDemoTicketEvents({
      message:
        'Missing SUPABASE_SERVICE_ROLE_KEY for server-side Supabase admin client.',
      nodeEnv: 'production',
    }),
    true
  );
});
