import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { EVENT_CONFIG } from "@/lib/registration-constants";
import { buildBadgeDisplayName } from "@/lib/registration-utils";

let cachedLogoDataUrl = null;

async function fileToDataUrl(filePath, mimeType) {
  const buffer = await fs.readFile(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function getBadgeLogoDataUrl() {
  if (cachedLogoDataUrl) {
    return cachedLogoDataUrl;
  }

  const customLogoPath = process.env.BADGE_LOGO_FILE_PATH?.trim();
  const fallbackPath = path.join(process.cwd(), "public", "img", "tasi-csr-logo.png");
  const logoPath = customLogoPath || fallbackPath;
  const extension = path.extname(logoPath).toLowerCase();
  const mimeType = extension === ".jpg" || extension === ".jpeg" ? "image/jpeg" : "image/png";
  cachedLogoDataUrl = await fileToDataUrl(logoPath, mimeType);
  return cachedLogoDataUrl;
}

export async function buildQrDataUrl(token) {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  });
}

export async function buildQrPngBuffer(token) {
  return QRCode.toBuffer(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 720,
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  });
}

function formatEventDateRange() {
  const start = new Date(`${EVENT_CONFIG.startDate}T00:00:00+05:30`);
  const end = new Date(`${EVENT_CONFIG.endDate}T00:00:00+05:30`);
  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startLabel = formatter.format(start);
  const endLabel = formatter.format(end);

  if (startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel} - ${endLabel}`;
}

function drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, headerLabel) {
  const displayName = buildBadgeDisplayName(registration);
  const badgeLabel = registration.badge_color_label || "Delegate";
  const eventDateRange = formatEventDateRange();
  const organizationLines = doc.splitTextToSize(registration.organization || "", 78);
  const attendeeLines = doc.splitTextToSize(displayName || "", 78);

  doc.setFillColor(249, 247, 241);
  doc.rect(0, 0, 101.6, 152.4, "F");

  doc.setFillColor(24, 30, 58);
  doc.rect(0, 0, 101.6, 31, "F");
  doc.setFillColor(201, 144, 44);
  doc.rect(0, 31, 101.6, 2.4, "F");

  doc.addImage(logoDataUrl, "PNG", 8, 7.5, 30, 11, undefined, "FAST");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text(EVENT_CONFIG.shortName, 8, 24);
  doc.setFontSize(7.5);
  doc.text(eventDateRange, 93.6, 11.5, { align: "right" });
  doc.setFontSize(11.5);
  doc.text("Trust and Safety", 43, 13.5);
  doc.text("India Festival 2026", 43, 20);
  doc.setFontSize(6.8);
  doc.setTextColor(223, 227, 239);
  doc.text(headerLabel, 93.6, 27, { align: "right" });

  doc.setTextColor(101, 115, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.text("ATTENDEE", 8, 43);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(attendeeLines, 8, 51);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(organizationLines, 8, 61);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 226, 237);
  doc.roundedRect(8, 69, 85.6, 25.5, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("REGISTRATION ID", 12, 76.5);
  doc.text("CATEGORY", 12, 87.5);
  doc.text("ACCESS TIER", 54, 76.5);
  doc.text("EVENT DATES", 54, 87.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.6);
  doc.setTextColor(15, 23, 42);
  doc.text(registration.registration_code || "-", 12, 81.5, { maxWidth: 34 });
  doc.text(registration.attendee_category || "-", 12, 91, { maxWidth: 34 });
  doc.text(badgeLabel, 54, 81.5, { maxWidth: 30 });
  doc.text(eventDateRange, 54, 91, { maxWidth: 30 });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(207, 214, 226);
  doc.roundedRect(8, 99, 85.6, 39, 3.5, 3.5, "FD");
  doc.setFillColor(249, 247, 241);
  doc.roundedRect(34.3, 103, 33, 33, 2.8, 2.8, "F");
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", 35.8, 104.5, 30, 30, undefined, "FAST");
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("QR pass not issued yet", 50.8, 120, { align: "center" });
  }

  doc.setFillColor(237, 242, 247);
  doc.roundedRect(8, 141.5, 85.6, 6.6, 2.5, 2.5, "F");
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("Present this credential with a valid government-issued ID.", 50.8, 145.8, { align: "center" });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(217, 119, 6);
  doc.roundedRect(72, 39.5, 21.6, 7.8, 2.2, 2.2, "FD");
  doc.setFillColor(201, 144, 44);
  doc.rect(72, 39.5, 3.2, 7.8, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(badgeLabel.toUpperCase(), 83, 44.6, { align: "center" });

  doc.setFillColor(24, 30, 58);
  doc.rect(0, 149.6, 101.6, 2.8, "F");
  doc.setFillColor(201, 144, 44);
  doc.rect(0, 149.6, 18, 2.8, "F");
}

export async function buildPassAttachment({ token, registration }) {
  const qrDataUrl = await buildQrDataUrl(token);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [152.4, 101.6],
  });
  const logoDataUrl = await getBadgeLogoDataUrl();
  drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, "OFFICIAL CONFERENCE CREDENTIAL");

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return {
    qrDataUrl,
    pdfBuffer,
    filename: `${registration.registration_code}-badge.pdf`,
  };
}

export function buildBadgeExportRows(registrations) {
  return registrations.map((registration) => ({
    registration_id: registration.id,
    registration_code: registration.registration_code,
    first_name: registration.first_name,
    last_name: registration.last_name,
    badge_display_name: buildBadgeDisplayName(registration),
    organization: registration.organization,
    category: registration.attendee_category,
    badge_color: registration.badge_color_label,
    badge_color_hex: registration.badge_color_hex,
    qr_token: registration.qr_token || "",
    status: registration.status,
    issue_date: registration.qr_pass_issued_at || "",
    print_batch_id: registration.last_badge_export_batch_id || "",
    exception_badge_required: registration.exception_badge_required ? "Yes" : "No",
  }));
}

export function buildCsvExport(rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  return XLSX.utils.sheet_to_csv(worksheet);
}

export function buildExcelExport(rows) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Badges");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export async function buildPdfMergeExport(registrations) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [152.4, 101.6],
  });
  const logoDataUrl = await getBadgeLogoDataUrl();

  for (let index = 0; index < registrations.length; index += 1) {
    const registration = registrations[index];
    const qrDataUrl = registration.qr_token ? await buildQrDataUrl(registration.qr_token) : null;

    if (index > 0) {
      doc.addPage([152.4, 101.6], "portrait");
    }
    drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, "BADGE EXPORT PROOF");
  }

  return Buffer.from(doc.output("arraybuffer"));
}
