export const ATTENDEE_CATEGORIES = [
  "Government",
  "NGO",
  "Academia",
  "Industry",
  "Media",
  "Student",
  "Other",
];

export const REGISTRATION_STATUSES = ["pending", "confirmed", "waitlisted", "rejected"];

export const BADGE_COLOR_MAP = {
  speaker: { label: "Speaker", hex: "#7C3AED" },
  government: { label: "Government", hex: "#1D4ED8" },
  ngo: { label: "NGO", hex: "#047857" },
  academia: { label: "Academia", hex: "#B45309" },
  media: { label: "Media", hex: "#BE185D" },
  student: { label: "Student", hex: "#0369A1" },
  other: { label: "Other", hex: "#4B5563" },
  tech: { label: "Industry", hex: "#374151" },
};

export const EVENT_CONFIG = {
  shortName: "TASI 2026",
  fullName: "Trust and Safety India Festival 2026",
  startDate: "2026-10-13",
  endDate: "2026-10-14",
  badgeFreezeDate: "2026-10-10",
  qrIssueDate: "2026-10-07",
  contactEmail: "info1@csrindia.org",
  venue: "New Delhi, India",
};

export const REGISTRATION_EMAIL_COPY = {
  submission_received: ({ firstName }) => ({
    subject: "We received your TASI 2026 registration",
    text: [
      `Hi ${firstName},`,
      "Thank you for registering for the Trust and Safety India Festival 2026 (TASI 2026) taking place on 13–14 October 2026 in New Delhi.",
      "Your application is now under review. We will be in touch once we have assessed your registration.",
      "We look forward to seeing you at TASI 2026.",
      "Warm regards,\nThe TASI 2026 Team",
    ].join("\n"),
  }),

  confirmed: ({ firstName }) => ({
    subject: "Your TASI 2026 registration is confirmed",
    text: [
      `Hi ${firstName},`,
      "Great news — your registration for the Trust and Safety India Festival 2026 (TASI 2026) has been confirmed.",
      "The event will take place on 13–14 October 2026 in New Delhi. Further details including venue information and your entry pass will be sent closer to the event.",
      "We look forward to welcoming you at TASI 2026.",
      "Warm regards,\nThe TASI 2026 Team",
    ].join("\n"),
  }),

  waitlisted: ({ firstName }) => ({
    subject: "Your TASI 2026 registration — waitlist update",
    text: [
      `Hi ${firstName},`,
      "Thank you for your interest in the Trust and Safety India Festival 2026 (TASI 2026).",
      "Your registration has been placed on our waitlist. We will contact you as soon as a confirmed spot becomes available.",
      "We appreciate your patience and hope to see you at TASI 2026.",
      "Warm regards,\nThe TASI 2026 Team",
    ].join("\n"),
  }),

  rejected: ({ firstName }) => ({
    subject: "TASI 2026 — Registration update",
    text: [
      `Hi ${firstName},`,
      "Thank you for applying to attend the Trust and Safety India Festival 2026 (TASI 2026).",
      "After review, we are unable to confirm your registration at this time. We had a large number of applicants and unfortunately could not accommodate everyone.",
      "We hope to see you at a future TASI event.",
      "Warm regards,\nThe TASI 2026 Team",
    ].join("\n"),
  }),

  qr_pass_issued: ({ firstName }) => ({
    subject: "Your TASI 2026 entry pass is ready",
    text: [
      `Hi ${firstName},`,
      "Your entry pass for the Trust and Safety India Festival 2026 (TASI 2026) is attached to this email as a PDF.",
      "Please bring a printed or digital copy of your pass on the day of the event. Your QR code will be scanned at the venue entrance.",
      "The event takes place on 13–14 October 2026 in New Delhi. We look forward to seeing you there.",
      "Warm regards,\nThe TASI 2026 Team",
    ].join("\n"),
  }),
};
