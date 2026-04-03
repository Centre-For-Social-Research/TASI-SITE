// Run: node --env-file=.env.local temp/test-festival-email.mjs
import { Resend } from "resend";
import { buildFestivalTicketPdf, buildFestivalInvoicePdf } from "../src/lib/festival-ticketing-documents.js";

const ticket = {
  id: "70d42380-2e27-4ea6-b8cd-982c38e2152d",
  user_id: "90a61843-104c-4b16-be53-f043afc1f5a7",
  ticket_number: "TASI-DOM-039A98",
  ticket_type: "domestic",
  payment_stream: "domestic",
  status: "confirmed",
  base_amount_minor: 1000000,
  tax_amount_minor: 180000,
  total_amount_minor: 1180000,
  currency: "INR",
  razorpay_order_id: "order_SZ9ebUtld7FC0w",
  razorpay_payment_id: "pay_TEST000000001",
  invoice_number: "TEST-INV-TASI-DOM-039A98",
  badge_number: null,
  qr_payload: "TASI-DOM-039A98:90a61843-104c-4b16-be53-f043afc1f5a7",
  created_at: "2026-04-03T08:18:30.741904+00:00",
  updated_at: "2026-04-03T20:38:47.293+00:00",
};

const user = {
  id: "90a61843-104c-4b16-be53-f043afc1f5a7",
  full_name: "Saquib Jamil",
  email: "saquib@csrindia.org",
  organization: "Centre For Social Research",
  job_title: "PC",
  country: "IN",
  phone: "+911146131929",
  billing_name: "Saquib Jamil",
  billing_email: "saquib@csrindia.org",
  billing_phone: "+911146131929",
  billing_address_line1: "2, Nelson Mandela Marg, Vasant Kunj, ND – 110070, India",
  billing_address_line2: "",
  billing_city: "New Delhi",
  billing_state_or_province: "Delhi",
  billing_postal_code: "110070",
  billing_country: "IN",
  tax_id_number: "BOGPJ2027F",
  gstin: "",
  passport_or_national_id: "",
  linkedin_url: null,
  profile_photo_path: null,
};

const apiKey = process.env.RESEND_API_KEY?.trim();
const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || "noreply@jamsaq.in";

console.log("Building PDFs...");
const [ticketPdf, invoicePdf] = await Promise.all([
  buildFestivalTicketPdf({ ticket, user }),
  buildFestivalInvoicePdf({ ticket, user }),
]);
console.log(`Ticket PDF: ${ticketPdf.length} bytes | Invoice PDF: ${invoicePdf.length} bytes`);

const resend = new Resend(apiKey);
const { data, error } = await resend.emails.send({
  from: fromEmail,
  to: [user.email],
  subject: `[TEST v2] TASI 2026 Confirmation — ${ticket.ticket_number}`,
  text: `Test email for invoice PDF review. Ticket: ${ticket.ticket_number}`,
  html: `<p>Test v2 — logo fix + redesigned invoice PDF attached.</p>`,
  attachments: [
    { filename: `${ticket.ticket_number}.pdf`, content: ticketPdf },
    { filename: `${ticket.invoice_number}.pdf`, content: invoicePdf },
  ],
});

if (error) { console.error("Error:", error); process.exit(1); }
console.log("Sent! ID:", data?.id, "→ check", user.email);
