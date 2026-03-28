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

function drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, headerLabel) {
  const displayName = buildBadgeDisplayName(registration);
  const badgeColor = registration.badge_color_hex || "#173B7A";
  const badgeLabel = registration.badge_color_label || "Delegate";

  doc.setFillColor(247, 242, 233);
  doc.rect(0, 0, 101.6, 152.4, "F");

  doc.setFillColor(38, 24, 88);
  doc.rect(0, 0, 101.6, 24, "F");
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 24, 101.6, 2.5, "F");

  doc.addImage(logoDataUrl, "PNG", 8, 6, 28, 10, undefined, "FAST");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.text("TRUST AND SAFETY INDIA FESTIVAL", 8, 19);
  doc.setFontSize(8);
  doc.text(EVENT_CONFIG.shortName, 79, 19, { align: "right" });

  doc.setTextColor(38, 24, 88);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(headerLabel, 8, 34);

  doc.setDrawColor(224, 211, 187);
  doc.setLineWidth(0.4);
  doc.line(8, 38, 93.6, 38);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(displayName, 8, 50, { maxWidth: 85 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(registration.organization || "", 8, 61, { maxWidth: 85 });

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(8, 68, 85.6, 24, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(8, 68, 85.6, 24, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.text("CATEGORY", 12, 75);
  doc.text("REGISTRATION ID", 12, 86);
  doc.text("BADGE LABEL", 55, 75);
  doc.text("EVENT DATE", 55, 86);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.text(registration.attendee_category || "", 12, 79.5, { maxWidth: 36 });
  doc.text(registration.registration_code || "", 12, 90.5, { maxWidth: 36 });
  doc.text(badgeLabel, 55, 79.5, { maxWidth: 34 });
  doc.text(`${EVENT_CONFIG.startDate} to ${EVENT_CONFIG.endDate}`, 55, 90.5, { maxWidth: 34 });

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(8, 98, 85.6, 41, 4, 4, "F");
  doc.setDrawColor(214, 211, 209);
  doc.roundedRect(8, 98, 85.6, 41, 4, 4, "S");
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", 27.8, 103, 46, 46, undefined, "FAST");
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("QR pass not issued yet", 50.8, 121, { align: "center" });
  }

  doc.setFillColor(240, 249, 255);
  doc.roundedRect(8, 141, 85.6, 7.5, 3, 3, "F");
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Present this badge with a valid government-issued ID", 50.8, 146, { align: "center" });

  doc.setFillColor(217, 119, 6);
  doc.rect(0, 149.9, 101.6, 2.5, "F");

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.text("Name-sorted registration desk", 8, 148.8);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(38, 24, 88);
  doc.roundedRect(74.5, 28.5, 19.1, 8.5, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(badgeColor === "#173B7A" ? badgeLabel.toUpperCase() : badgeLabel.toUpperCase(), 84, 34, { align: "center" });
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
