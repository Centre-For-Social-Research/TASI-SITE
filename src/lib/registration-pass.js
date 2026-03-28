import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { EVENT_CONFIG } from "@/lib/registration-constants";
import { buildBadgeDisplayName, PROFILE_BUCKET } from "@/lib/registration-utils";

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

async function bufferToDataUrl(buffer, mimeType) {
  return `data:${mimeType};base64,${Buffer.from(buffer).toString("base64")}`;
}

function getMimeTypeFromPhotoPath(photoPath) {
  const extension = path.extname(String(photoPath || "")).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  return "image/png";
}

async function getBadgePhotoDataUrl(registration) {
  const photoPath = String(registration?.profile_photo_path || "").trim();

  if (!photoPath) {
    return null;
  }

  try {
    const supabase = getSupabaseAdmin();
    const downloadResult = await supabase.storage.from(PROFILE_BUCKET).download(photoPath);

    if (downloadResult.error || !downloadResult.data) {
      return null;
    }

    const arrayBuffer = await downloadResult.data.arrayBuffer();
    return bufferToDataUrl(Buffer.from(arrayBuffer), getMimeTypeFromPhotoPath(photoPath));
  } catch {
    return null;
  }
}

function getImageFormatFromDataUrl(dataUrl, fallback = "PNG") {
  if (typeof dataUrl !== "string") {
    return fallback;
  }

  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) {
    return "JPEG";
  }

  if (dataUrl.startsWith("data:image/png")) {
    return "PNG";
  }

  return fallback;
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

function drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, photoDataUrl, headerLabel) {
  const displayName = buildBadgeDisplayName(registration);
  const badgeLabel = registration.badge_color_label || "Delegate";
  const organizationLines = doc.splitTextToSize(registration.organization || "", 54);
  const attendeeLines = doc.splitTextToSize(displayName || "", 54);
  const categoryLabel = registration.attendee_category || "Delegate";
  const policyRules = [
    "Carry a valid government-issued photo ID.",
    "Badge is valid only for the registered attendee.",
    "Security and venue instructions must be followed at all times.",
  ];

  doc.setFillColor(250, 248, 242);
  doc.rect(0, 0, 101.6, 152.4, "F");

  doc.setFillColor(24, 30, 58);
  doc.rect(0, 0, 101.6, 29.5, "F");
  doc.setFillColor(201, 144, 44);
  doc.rect(0, 29.5, 101.6, 1.8, "F");

  doc.addImage(logoDataUrl, "PNG", 7, 7, 25, 10.6, undefined, "FAST");
  doc.setDrawColor(78, 89, 130);
  doc.setLineWidth(0.5);
  doc.line(34.7, 4, 34.7, 24.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.8);
  doc.text("Trust & Safety India Festival", 39, 11.2);
  doc.setTextColor(214, 171, 65);
  doc.setFontSize(7.6);
  doc.text("TASI 2026", 39, 16.9);
  doc.text("13-14 October 2026", 58.3, 16.9);
  doc.setTextColor(235, 239, 247);
  doc.setFontSize(7.8);
  doc.text("New Delhi, India", 39, 22.8);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(73.2, 18.8, 20.6, 6.9, 1.8, 1.8, "F");
  doc.setTextColor(24, 30, 58);
  doc.setFontSize(5.9);
  doc.text(headerLabel, 83.5, 23.2, { align: "center" });

  doc.setTextColor(101, 115, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("ATTENDEE", 8, 39.5);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17.8);
  doc.text(attendeeLines, 8, 48.8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  doc.text(organizationLines, 8, 57.8);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(15, 23, 42);
  doc.rect(73.2, 36.3, 20.8, 20.8, "FD");
  if (photoDataUrl) {
    doc.addImage(photoDataUrl, getImageFormatFromDataUrl(photoDataUrl, "JPEG"), 73.9, 37, 19.4, 19.4, undefined, "FAST");
  } else {
    doc.setFillColor(201, 144, 44);
    doc.circle(83.6, 43.8, 3.4, "F");
    doc.setFillColor(38, 71, 130);
    doc.circle(83.6, 50.4, 5.8, "F");
  }

  doc.setFillColor(34, 69, 126);
  doc.roundedRect(8, 61, 84.2, 7.5, 2.4, 2.4, "F");
  doc.setFillColor(101, 177, 255);
  doc.circle(12.4, 64.75, 1.35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.1);
  doc.text(`${badgeLabel.toUpperCase()} TIER`, 16, 65.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.text(categoryLabel, 84.5, 65.5, { align: "right" });

  doc.setDrawColor(224, 228, 235);
  doc.setLineWidth(0.35);
  doc.line(8, 74, 93.6, 74);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text("REG. ID", 8, 81);
  doc.text("CATEGORY", 40, 81);
  doc.text("DATES", 69, 81);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(registration.registration_code || "-", 8, 86);
  doc.text(categoryLabel, 40, 86, { maxWidth: 22 });
  doc.text("13-14 Oct 2026", 69, 86, { maxWidth: 24 });

  doc.setDrawColor(224, 228, 235);
  doc.line(8, 90, 93.6, 90);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("ENTRY PASS", 8, 98);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11.8);
  doc.text("Scan to verify", 8, 107);
  doc.setDrawColor(201, 144, 44);
  doc.setLineWidth(0.7);
  doc.line(8, 111.2, 32.8, 111.2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.9);
  doc.text("Show this pass with", 8, 120);
  doc.text("a valid photo ID at", 8, 126);
  doc.text("the venue entrance.", 8, 132);

  doc.setTextColor(201, 144, 44);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.text("Policy rules", 8, 141);
  doc.setTextColor(88, 102, 122);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.text(`- ${policyRules[0]}`, 8, 146);
  doc.text(`- ${policyRules[1]}`, 8, 150.2);
  doc.text(`- ${policyRules[2]}`, 8, 154.4);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 224, 232);
  doc.setLineWidth(0.7);
  doc.roundedRect(60, 97.5, 32.5, 32.5, 2.8, 2.8, "FD");
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", 62, 99.5, 28.2, 28.2, undefined, "FAST");
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("QR pass not", 76.5, 113, { align: "center" });
    doc.text("issued yet", 76.5, 118, { align: "center" });
  }

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.text(registration.registration_code || "-", 76.5, 133.8, { align: "center" });

  doc.setFillColor(24, 30, 58);
  doc.rect(0, 147.6, 101.6, 4.8, "F");
  doc.setFillColor(201, 144, 44);
  doc.rect(0, 147.6, 2.6, 4.8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.6);
  doc.text("Organised by Centre for Social Research • Trust and Safety Festival", 50.8, 150.6, {
    align: "center",
  });
}

export async function buildPassAttachment({ token, registration }) {
  const qrDataUrl = await buildQrDataUrl(token);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [152.4, 101.6],
  });
  const logoDataUrl = await getBadgeLogoDataUrl();
  const photoDataUrl = await getBadgePhotoDataUrl(registration);
  drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, photoDataUrl, "OFFICIAL CREDENTIAL");

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
    const photoDataUrl = await getBadgePhotoDataUrl(registration);

    if (index > 0) {
      doc.addPage([152.4, 101.6], "portrait");
    }
    drawInstitutionalBadge(doc, registration, qrDataUrl, logoDataUrl, photoDataUrl, "BADGE EXPORT PROOF");
  }

  return Buffer.from(doc.output("arraybuffer"));
}
