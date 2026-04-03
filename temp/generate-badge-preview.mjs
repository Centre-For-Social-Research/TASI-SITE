import { writeFile } from "node:fs/promises";
import path from "node:path";
import { buildFestivalBadgePdf } from "../src/lib/festival-ticketing-documents.js";

const ticket = {
  id: "ticket-preview-1",
  ticket_number: "TASI-DOM-00001",
  badge_number: "BADGE-00001",
  ticket_type: "domestic",
  qr_payload: "TASI2026:ticket-preview-1:signature",
};

const user = {
  full_name: "Aditi Rao",
  organization: "Centre for Internet and Society",
  country: "IN",
};

const pdfBuffer = await buildFestivalBadgePdf({ ticket, user });

const pdfPath = path.join(import.meta.dirname, "badge-preview.pdf");
await writeFile(pdfPath, pdfBuffer);
console.log("Badge PDF written to", pdfPath);

// Also generate an international delegate variant
const ticketIntl = {
  ...ticket,
  ticket_number: "TASI-INT-00001",
  badge_number: "BADGE-INT-00001",
  ticket_type: "international",
};
const userIntl = {
  full_name: "Dr. Priya Subramaniam",
  organization: "Digital Futures Lab, Singapore",
  country: "SG",
};

const pdfIntlBuffer = await buildFestivalBadgePdf({ ticket: ticketIntl, user: userIntl });
const pdfIntlPath = path.join(import.meta.dirname, "badge-preview-intl.pdf");
await writeFile(pdfIntlPath, pdfIntlBuffer);
console.log("International badge PDF written to", pdfIntlPath);
