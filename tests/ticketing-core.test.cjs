const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function importModule(relativePath) {
  const moduleUrl = pathToFileURL(path.join(process.cwd(), relativePath)).href;
  return import(moduleUrl);
}

test('amountInrToPaise rounds donation amounts to whole paise', async () => {
  const { amountInrToPaise } = await importModule(
    'src/lib/ticketing-pricing.js'
  );

  assert.equal(amountInrToPaise(500), 50000);
  assert.equal(amountInrToPaise('500.50'), 50050);
  assert.equal(amountInrToPaise('99.999'), 10000);
});

test('amountInrToPaise rejects invalid or non-positive donation amounts', async () => {
  const { amountInrToPaise } = await importModule(
    'src/lib/ticketing-pricing.js'
  );

  assert.throws(() => amountInrToPaise(''), /valid amount/i);
  assert.throws(() => amountInrToPaise('abc'), /valid amount/i);
  assert.throws(() => amountInrToPaise(0), /greater than zero/i);
});

test('buildOrderPricing applies fixed paid pricing and donation minimums', async () => {
  const { buildOrderPricing } = await importModule(
    'src/lib/ticketing-pricing.js'
  );

  const pricing = buildOrderPricing({
    ticketSelections: [
      {
        ticketType: {
          id: 'standard',
          ticket_mode: 'paid',
          price_paise: 250000,
          min_donation_paise: null,
        },
        quantity: 2,
      },
      {
        ticketType: {
          id: 'supporter',
          ticket_mode: 'donation',
          price_paise: null,
          min_donation_paise: 50000,
        },
        quantity: 1,
        donationAmountInr: 600,
      },
    ],
  });

  assert.equal(pricing.subtotalPaise, 560000);
  assert.equal(pricing.totalPaise, 560000);
  assert.equal(pricing.lineItems[0].unitAmountPaise, 250000);
  assert.equal(pricing.lineItems[1].unitAmountPaise, 60000);

  assert.throws(
    () =>
      buildOrderPricing({
        ticketSelections: [
          {
            ticketType: {
              id: 'community',
              ticket_mode: 'donation',
              min_donation_paise: 50000,
            },
            quantity: 1,
            donationAmountInr: 300,
          },
        ],
      }),
    /minimum donation/i
  );
});

test('summarizeTicketAvailability ignores expired holds in availability calculations', async () => {
  const { summarizeTicketAvailability } = await importModule(
    'src/lib/ticketing-availability.js'
  );

  const summary = summarizeTicketAvailability({
    capacity: 10,
    soldQuantity: 4,
    holds: [
      { quantity: 2, expires_at: '2026-04-01T18:30:00.000Z' },
      { quantity: 3, expires_at: '2026-04-01T17:00:00.000Z' },
    ],
    now: '2026-04-01T18:00:00.000Z',
  });

  assert.equal(summary.activeHeldQuantity, 2);
  assert.equal(summary.expiredHeldQuantity, 3);
  assert.equal(summary.availableQuantity, 4);
  assert.equal(summary.isSoldOut, false);
});

test('summarizeTicketAvailability never reports negative remaining inventory', async () => {
  const { summarizeTicketAvailability } = await importModule(
    'src/lib/ticketing-availability.js'
  );

  const summary = summarizeTicketAvailability({
    capacity: 5,
    soldQuantity: 4,
    holds: [{ quantity: 7, expires_at: '2026-04-01T19:00:00.000Z' }],
    now: '2026-04-01T18:00:00.000Z',
  });

  assert.equal(summary.availableQuantity, 0);
  assert.equal(summary.isSoldOut, true);
});
