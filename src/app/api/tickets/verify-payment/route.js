import { protectPublicPostRoute } from '@/lib/api-security';
import { sendFestivalTicketConfirmationEmail } from '@/lib/festival-ticketing-email';
import { createFestivalVerifyPaymentHandler } from '@/lib/festival-payment-route-handlers.mjs';
import {
  confirmFestivalTicketPayment,
  getFestivalTicketById,
  recordFestivalPaymentAudit,
} from '@/lib/festival-ticketing-db';
import { festivalVerifyPaymentSchema } from '@/lib/festival-ticketing-validation';
import { verifyFestivalRazorpayCheckoutSignature } from '@/lib/razorpay';

export const POST = createFestivalVerifyPaymentHandler({
  protectPublicPostRoute,
  festivalVerifyPaymentSchema,
  getFestivalTicketById,
  verifyFestivalRazorpayCheckoutSignature,
  recordFestivalPaymentAudit,
  confirmFestivalTicketPayment,
  sendFestivalTicketConfirmationEmail,
});
