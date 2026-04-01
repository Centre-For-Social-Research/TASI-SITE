import { z } from "zod";
import {
  TICKET_EVENT_STATUSES,
  TICKET_MODES,
} from "@/lib/ticketing-constants";

const isoDateString = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Must be a valid ISO date");

const attendeeSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(6).max(40),
});

const ticketTypeSchema = z
  .object({
    tierKey: z.string().trim().min(2).max(40),
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(1200).optional().default(""),
    ticketMode: z.enum(TICKET_MODES),
    pricePaise: z.number().int().min(0).nullable().optional().default(null),
    minDonationPaise: z
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .default(null),
    capacity: z.number().int().min(0),
    perOrderLimit: z.number().int().min(1).max(20).default(10),
    saleStartsAt: isoDateString.nullable().optional().default(null),
    saleEndsAt: isoDateString.nullable().optional().default(null),
    isActive: z.boolean().default(true),
    displayOrder: z.number().int().min(0).default(0),
    badgePattern: z.string().trim().max(40).optional().default("default"),
    shortDescription: z.string().trim().max(800).optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (value.ticketMode === "paid" && value.pricePaise == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid tickets require pricePaise.",
        path: ["pricePaise"],
      });
    }

    if (value.ticketMode === "donation" && value.minDonationPaise == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Donation tickets require minDonationPaise.",
        path: ["minDonationPaise"],
      });
    }
  });

export const createTicketEventSchema = z.object({
  slug: z.string().trim().min(3).max(120),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(4000).optional().default(""),
  venue: z.string().trim().max(200).optional().default(""),
  startsAt: isoDateString,
  endsAt: isoDateString.nullable().optional().default(null),
  timezone: z.string().trim().min(3).max(80).default("Asia/Kolkata"),
  status: z.enum(TICKET_EVENT_STATUSES).default("draft"),
  heroLabel: z.string().trim().max(120).optional().default(""),
  ticketTypes: z.array(ticketTypeSchema).min(1).max(10),
});

export const createTicketOrderSchema = z
  .object({
    eventId: z.string().uuid(),
    buyer: z.object({
      fullName: z.string().trim().min(2).max(120),
      email: z.string().trim().email().max(320),
      phone: z.string().trim().min(6).max(40),
    }),
    ticketSelections: z
      .array(
        z.object({
          ticketTypeId: z.string().uuid(),
          quantity: z.number().int().min(1).max(10),
          donationAmountInr: z.number().positive().optional(),
          attendees: z.array(attendeeSchema).min(1).max(10),
        }),
      )
      .min(1)
      .max(10),
  })
  .superRefine((value, ctx) => {
    for (const [index, selection] of value.ticketSelections.entries()) {
      if (selection.attendees.length !== selection.quantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Attendee count must match quantity.",
          path: ["ticketSelections", index, "attendees"],
        });
      }
    }
  });

export const verifyTicketPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

export const ticketLookupSchema = z.object({
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(40),
});

export const patchTicketEventSchema = z.object({
  status: z.enum(TICKET_EVENT_STATUSES).optional(),
  ticketTypes: z
    .array(
      z.object({
        id: z.string().uuid(),
        capacity: z.number().int().min(0).optional(),
        saleStartsAt: isoDateString.nullable().optional(),
        saleEndsAt: isoDateString.nullable().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .optional()
    .default([]),
});
