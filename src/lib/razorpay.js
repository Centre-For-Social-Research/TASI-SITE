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

export function getPublicRazorpayConfig() {
  return {
    keyId:
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || getRazorpayKeyId(),
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
