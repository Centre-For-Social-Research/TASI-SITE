import { z } from "zod";

const countryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, "Country must be a valid ISO 3166-1 alpha-2 code.");

const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .refine(
    (value) => !value || /^\+?[0-9\s\-()]{7,30}$/.test(value),
    "Phone must be a valid phone number.",
  );

const textField = (label, min, max, required = true) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .superRefine((value, ctx) => {
      if (required && value.length < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} must be at least ${min} characters.`,
        });
      }
    });

const booleanConsent = (message) =>
  z.literal(true, {
    errorMap: () => ({
      message,
    }),
  });

export const festivalCreateOrderSchema = z
  .object({
    fullName: textField("Full name", 2, 200)
      .regex(/^[A-Za-z\s'\-]+$/, "Full name contains unsupported characters."),
    email: z.string().trim().email().max(254),
    confirmEmail: z.string().trim().email().max(254),
    organization: textField("Organization", 2, 300, false).optional().default(""),
    jobTitle: textField("Job title", 2, 200, false).optional().default(""),
    country: countryCodeSchema,
    phone: phoneSchema.optional().default(""),
    billingName: textField("Billing name", 2, 200),
    billingEmail: z.string().trim().email().max(254),
    billingPhone: phoneSchema,
    billingAddressLine1: textField("Billing address line 1", 3, 200),
    billingAddressLine2: textField("Billing address line 2", 0, 200, false)
      .optional()
      .default(""),
    billingCity: textField("Billing city", 2, 120),
    billingStateOrProvince: textField("Billing state or province", 2, 120),
    billingPostalCode: textField("Billing postal code", 3, 30),
    billingCountry: countryCodeSchema,
    taxIdNumber: textField("Tax ID number (PAN)", 5, 80),
    gstin: textField("GSTIN", 0, 20, false).optional().default(""),
    passportOrNationalId: textField("Passport or national ID", 0, 80, false)
      .optional()
      .default(""),
    noRefundAccepted: booleanConsent(
      "No-refund policy must be acknowledged before payment.",
    ),
    termsAccepted: booleanConsent("Terms must be accepted before payment."),
    privacyAccepted: booleanConsent("Privacy policy must be accepted before payment."),
  })
  .superRefine((value, ctx) => {
    if (value.email.toLowerCase() !== value.confirmEmail.toLowerCase()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email confirmation does not match.",
        path: ["confirmEmail"],
      });
    }

    if (value.country !== "IN" && !value.passportOrNationalId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passport or national ID is required for international ticketing.",
        path: ["passportOrNationalId"],
      });
    }
  });

export const festivalVerifyPaymentSchema = z.object({
  ticketId: z.string().uuid(),
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

export const festivalTicketLookupSchema = z.object({
  email: z.string().trim().email(),
  phone: phoneSchema,
});
