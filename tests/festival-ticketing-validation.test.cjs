const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

async function importModule(relativePath) {
  const moduleUrl = pathToFileURL(path.join(process.cwd(), relativePath)).href;
  return import(moduleUrl);
}

function buildBasePayload(overrides = {}) {
  return {
    fullName: "Aditi Rao",
    email: "aditi@example.com",
    confirmEmail: "aditi@example.com",
    organization: "Trust & Safety India",
    jobTitle: "Policy Lead",
    country: "IN",
    phone: "+91 9876543210",
    billingName: "Aditi Rao",
    billingEmail: "billing@example.com",
    billingPhone: "+91 9876543210",
    billingAddressLine1: "12 Lodhi Road",
    billingAddressLine2: "Near Central Office",
    billingCity: "New Delhi",
    billingStateOrProvince: "Delhi",
    billingPostalCode: "110003",
    billingCountry: "IN",
    taxIdNumber: "AAACA1234A",
    gstin: "07ABCDE1234F1Z5",
    passportOrNationalId: "",
    noRefundAccepted: true,
    termsAccepted: true,
    privacyAccepted: true,
    ...overrides,
  };
}

test("festival create order schema accepts domestic payload with GST billing details", async () => {
  const { festivalCreateOrderSchema } = await importModule(
    "src/lib/festival-ticketing-validation.js",
  );

  const parsed = festivalCreateOrderSchema.parse(buildBasePayload());

  assert.equal(parsed.country, "IN");
  assert.equal(parsed.billingCountry, "IN");
  assert.equal(parsed.gstin, "07ABCDE1234F1Z5");
  assert.equal(parsed.noRefundAccepted, true);
});

test("festival create order schema accepts international payload with passport id and no GSTIN", async () => {
  const { festivalCreateOrderSchema } = await importModule(
    "src/lib/festival-ticketing-validation.js",
  );

  const parsed = festivalCreateOrderSchema.parse(
    buildBasePayload({
      country: "US",
      billingCountry: "US",
      taxIdNumber: "US-TAX-8821",
      gstin: "",
      passportOrNationalId: "P1234567",
      billingPostalCode: "10001",
    }),
  );

  assert.equal(parsed.country, "US");
  assert.equal(parsed.billingCountry, "US");
  assert.equal(parsed.passportOrNationalId, "P1234567");
});

test("festival create order schema accepts domestic payload with optional GSTIN", async () => {
  const { festivalCreateOrderSchema } = await importModule(
    "src/lib/festival-ticketing-validation.js",
  );

  const parsed = festivalCreateOrderSchema.parse(
    buildBasePayload({
      gstin: "",
    }),
  );

  assert.equal(parsed.country, "IN");
  assert.equal(parsed.billingCountry, "IN");
  assert.equal(parsed.gstin, "");
});

test("festival create order schema rejects missing PAN (taxIdNumber)", async () => {
  const { festivalCreateOrderSchema } = await importModule(
    "src/lib/festival-ticketing-validation.js",
  );

  assert.throws(
    () =>
      festivalCreateOrderSchema.parse(
        buildBasePayload({
          taxIdNumber: "",
        }),
      ),
    /Tax ID number|PAN/i,
  );
});

test("festival create order schema rejects missing no-refund consent", async () => {
  const { festivalCreateOrderSchema } = await importModule(
    "src/lib/festival-ticketing-validation.js",
  );

  assert.throws(
    () =>
      festivalCreateOrderSchema.parse(
        buildBasePayload({
          noRefundAccepted: false,
        }),
      ),
    /expected true|refund/i,
  );
});
