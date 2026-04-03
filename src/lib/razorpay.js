import crypto from "node:crypto";

function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID?.trim() || "";
}

function getRazorpayKeySecret() {
  return process.env.RAZORPAY_KEY_SECRET?.trim() || "";
}

function getRazorpayWebhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || "";
}

function getFestivalRazorpayCredentials(paymentStream) {
  if (paymentStream === "domestic") {
    return {
      keyId: process.env.RAZORPAY_KEY_DOMESTIC?.trim() || "",
      keySecret: process.env.RAZORPAY_SECRET_DOMESTIC?.trim() || "",
      webhookSecret:
        process.env.RAZORPAY_WEBHOOK_SECRET_DOMESTIC?.trim() || "",
    };
  }

  return {
    keyId: process.env.RAZORPAY_KEY_FCRA?.trim() || "",
    keySecret: process.env.RAZORPAY_SECRET_FCRA?.trim() || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET_FCRA?.trim() || "",
  };
}

export function getPublicRazorpayConfig() {
  return {
    keyId:
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || getRazorpayKeyId(),
  };
}

export function getFestivalPublicRazorpayConfig(paymentStream) {
  return {
    keyId: getFestivalRazorpayCredentials(paymentStream).keyId,
  };
}

export async function createRazorpayOrder({
  amountPaise,
  receipt,
  notes = {},
  currency = "INR",
}) {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString(
        "base64",
      )}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency,
      receipt,
      notes,
      payment_capture: 1,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload?.error?.description || "Unable to create Razorpay order.",
    );
  }

  return payload;
}

export async function createFestivalRazorpayOrder({
  amountMinor,
  receipt,
  notes = {},
  currency,
  paymentStream,
}) {
  const { keyId, keySecret } = getFestivalRazorpayCredentials(paymentStream);

  if (!keyId || !keySecret) {
    throw new Error(`Razorpay credentials are not configured for ${paymentStream}.`);
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString(
        "base64",
      )}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountMinor,
      currency,
      receipt,
      notes,
      payment_capture: 1,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload?.error?.description || "Unable to create Razorpay order.",
    );
  }

  return payload;
}

export function verifyRazorpayCheckoutSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  const keySecret = getRazorpayKeySecret();
  if (!keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(String(razorpaySignature)),
  );
}

export function verifyFestivalRazorpayCheckoutSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  paymentStream,
}) {
  const { keySecret } = getFestivalRazorpayCredentials(paymentStream);
  if (!keySecret) {
    throw new Error(`Razorpay credentials are not configured for ${paymentStream}.`);
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(String(razorpaySignature)),
  );
}

export function verifyRazorpayWebhookSignature({ payload, signature }) {
  const webhookSecret = getRazorpayWebhookSecret();
  if (!webhookSecret) {
    throw new Error("Razorpay webhook secret is not configured.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(String(signature || "")),
  );
}

export function verifyFestivalRazorpayWebhookSignature({
  payload,
  signature,
  paymentStream,
}) {
  const { webhookSecret } = getFestivalRazorpayCredentials(paymentStream);
  if (!webhookSecret) {
    throw new Error(`Razorpay webhook secret is not configured for ${paymentStream}.`);
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(String(signature || "")),
  );
}
