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

test("buildFestivalInvoiceDocumentModel uses the branded confirmation header and formal invoice sections", async () => {
  const { buildFestivalInvoiceDocumentModel } = await importModule(
    "src/lib/festival-ticketing-documents.js",
  );

  const model = buildFestivalInvoiceDocumentModel({
    ticket: {
      id: "ticket-1",
      ticket_number: "TASI-DOM-00001",
      invoice_number: "INV-DOM-2026-CKET1",
      ticket_type: "domestic",
      currency: "INR",
      base_amount_minor: 1000000,
      tax_amount_minor: 180000,
      total_amount_minor: 1180000,
      created_at: "2026-07-01T10:00:00.000Z",
      qr_payload: "TASI2026:festival-ticket-123:signature",
    },
    user: {
      full_name: "Aditi Rao",
      email: "aditi@example.com",
      phone: "+91 9876543210",
      organization: "Example Org",
      country: "IN",
      billing_name: "Aditi Rao",
      billing_email: "billing@example.com",
      billing_phone: "+91 9876543210",
      billing_address_line1: "221B Baker Street",
      billing_city: "New Delhi",
      billing_state_or_province: "Delhi",
      billing_postal_code: "110001",
      billing_country: "India",
      tax_id_number: "ABCDE1234F",
      gstin: "07ABCDE1234F1Z5",
    },
  });

  assert.equal(model.header.eyebrow, "TASI 2026");
  assert.equal(model.header.title, "Trust and Safety India Festival 2026");
  assert.equal(model.meta.invoiceNumber, "INV-DOM-2026-CKET1");
  assert.equal(model.meta.ticketNumber, "TASI-DOM-00001");
  assert.equal(model.seller.taxIdLabel, "PAN");
  assert.equal(model.buyer.taxIdLabel, "GSTIN");
  assert.match(model.lineItems[0].description, /Full Access Pass/i);
  assert.equal(model.totals[0].label, "Base Amount");
  assert.equal(model.totals[1].label, "GST");
  assert.equal(model.totals[2].emphasis, true);
  assert.equal(model.notes.at(-1), "Generated for compliance and attendee verification.");
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
