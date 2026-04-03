const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

async function importModule(relativePath) {
  const moduleUrl = pathToFileURL(path.join(process.cwd(), relativePath)).href;
  return import(moduleUrl);
}

test("deriveFestivalTicketPurchaseDetails routes India to domestic INR pricing with GST", async () => {
  const { deriveFestivalTicketPurchaseDetails } = await importModule(
    "src/lib/festival-ticketing-core.js",
  );

  assert.deepEqual(deriveFestivalTicketPurchaseDetails({ country: "IN" }), {
    ticketType: "domestic",
    paymentStream: "domestic",
    currency: "INR",
    baseAmountMinor: 1000000,
    taxAmountMinor: 180000,
    totalAmountMinor: 1180000,
    displayPrice: "INR 11,800",
    taxable: true,
  });
});

test("deriveFestivalTicketPurchaseDetails routes non-India attendees to the FCRA USD price with no GST", async () => {
  const { deriveFestivalTicketPurchaseDetails } = await importModule(
    "src/lib/festival-ticketing-core.js",
  );

  assert.deepEqual(deriveFestivalTicketPurchaseDetails({ country: "US" }), {
    ticketType: "international",
    paymentStream: "fcra",
    currency: "USD",
    baseAmountMinor: 20000,
    taxAmountMinor: 0,
    totalAmountMinor: 20000,
    displayPrice: "USD 200",
    taxable: false,
  });
});

test("deriveFestivalTicketPurchaseDetails normalizes country codes and ignores client override attempts", async () => {
  const { deriveFestivalTicketPurchaseDetails } = await importModule(
    "src/lib/festival-ticketing-core.js",
  );

  const result = deriveFestivalTicketPurchaseDetails({
    country: " in ",
    ticketType: "international",
    paymentStream: "fcra",
    currency: "USD",
  });

  assert.equal(result.ticketType, "domestic");
  assert.equal(result.paymentStream, "domestic");
  assert.equal(result.currency, "INR");
});

test("buildFestivalInvoiceMetadata returns GST invoice details for domestic tickets", async () => {
  const { buildFestivalInvoiceMetadata } = await importModule(
    "src/lib/festival-ticketing-documents.js",
  );

  const invoice = buildFestivalInvoiceMetadata({
    ticket: {
      id: "ticket-1",
      ticket_number: "TASI-DOM-00001",
      ticket_type: "domestic",
      currency: "INR",
      base_amount_minor: 1000000,
      tax_amount_minor: 180000,
      total_amount_minor: 1180000,
      created_at: "2026-07-01T10:00:00.000Z",
    },
    user: {
      full_name: "Aditi Rao",
      email: "aditi@example.com",
      country: "IN",
    },
  });

  assert.match(invoice.invoiceNumber, /^INV-DOM-2026-/);
  assert.equal(invoice.currency, "INR");
  assert.equal(invoice.taxLabel, "GST");
  assert.equal(invoice.taxAmountMinor, 180000);
  assert.match(invoice.description, /Full Access Pass/i);
});

test("buildFestivalInvoiceMetadata returns export invoice details for international tickets", async () => {
  const { buildFestivalInvoiceMetadata } = await importModule(
    "src/lib/festival-ticketing-documents.js",
  );

  const invoice = buildFestivalInvoiceMetadata({
    ticket: {
      id: "ticket-2",
      ticket_number: "TASI-INT-00001",
      ticket_type: "international",
      currency: "USD",
      base_amount_minor: 20000,
      tax_amount_minor: 0,
      total_amount_minor: 20000,
      created_at: "2026-07-01T10:00:00.000Z",
    },
    user: {
      full_name: "Sam Lee",
      email: "sam@example.com",
      country: "US",
    },
  });

  assert.match(invoice.invoiceNumber, /^INV-INT-2026-/);
  assert.equal(invoice.currency, "USD");
  assert.equal(invoice.taxLabel, "Zero-rated export");
  assert.equal(invoice.taxAmountMinor, 0);
});

test("festival QR payload uses signed token format and rejects tampering", async () => {
  process.env.QR_HMAC_SECRET = "test-qr-secret";
  const { buildFestivalQrPayload, verifyFestivalQrPayload } = await importModule(
    "src/lib/festival-ticketing-qr.js",
  );

  const payload = buildFestivalQrPayload("festival-ticket-123");
  assert.match(payload, /^TASI2026:festival-ticket-123:/);
  assert.equal(verifyFestivalQrPayload(payload), "festival-ticket-123");
  assert.equal(
    verifyFestivalQrPayload(payload.replace("festival-ticket-123", "other")),
    null,
  );
});
