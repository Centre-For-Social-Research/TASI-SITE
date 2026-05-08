import {
  EVENT_CONFIG,
  QR_PASS_RELEASE_TIMING,
} from '../lib/registration-constants.js';

export const registerPageMetadata = {
  title: 'Register | TASI 2026',
  description:
    'Apply for general access to TASI 2026 or choose a paid festival ticket for confirmed access, hospitality, and reception benefits.',
};

export const registerPageHero = {
  eyebrow: 'TASI 2026 Registration',
  title: 'Apply First.',
  titleAccent: 'Confirm Later.',
  description:
    'TASI 2026 follows an approval-based delegate process. Submission acknowledges your application, while confirmed attendees receive QR access closer to the event.',
};

export const generalAccessIntro = {
  eyebrow: 'Apply for General Access',
  description:
    'This is a manual review process. Submit your application and our team will review your details. You will receive a confirmation if selected.',
};

export const registrationOverview = {
  audience:
    'Registration is open to government stakeholders, industry leaders, civil society, researchers, students, media, and international participants aligned with trust and safety.',
  review:
    'Every application is manually reviewed. If you are confirmed, your QR pass will be shared {{QR_PASS_RELEASE_TIMING}} and your pre-printed badge will be available at the name-sorted registration desk.',
};

export const registrationSteps = [
  {
    title: 'Submit Your Application',
    details:
      'Complete the TASI 2026 form with your delegate details, LinkedIn profile, and profile photo.',
  },
  {
    title: 'Team Review and Status Update',
    details:
      'Our reviewers will evaluate your application and notify you if you are confirmed, waitlisted, or not approved.',
  },
  {
    title: 'QR Pass and Badge Pickup',
    details: `Confirmed attendees receive their QR-based entry pass ${QR_PASS_RELEASE_TIMING} and collect pre-printed badges at the venue.`,
  },
];

export const registrationFaqs = [
  {
    question: 'Will I be confirmed immediately after I register?',
    answer:
      'No. Every registration is reviewed by the TASI team. You will first receive a submission acknowledgment, followed by a later status email.',
  },
  {
    question: 'When will confirmed attendees receive the QR pass?',
    answer: `Confirmed attendees will receive their QR-based entry pass by email ${QR_PASS_RELEASE_TIMING}.`,
  },
  {
    question: 'What do I need to bring on event day?',
    answer:
      'Please carry your QR pass and any valid government-issued ID. The registration desk will scan the QR code before badge handover.',
  },
  {
    question: 'Can I transfer my registration to someone else?',
    answer:
      'No. Registrations are strictly non-transferable and are valid only for the approved individual.',
  },
  {
    question: 'What if I can no longer attend after being confirmed?',
    answer:
      'Please inform the organising team in advance so we can manage waitlisted attendees effectively.',
  },
];

export const registerSupport = {
  label: 'Need support? Email',
  email: EVENT_CONFIG.contactEmail,
};

export const paidTicketingIntro = {
  dividerLabel: 'OR',
  title: 'Skip the wait. Get full access to the festival.',
  description:
    'Move from application-only access to the full festival experience, including paid entry, hospitality, and reception access.',
};

export function formatRegistrationReviewCopy() {
  return registrationOverview.review.replace(
    '{{QR_PASS_RELEASE_TIMING}}',
    QR_PASS_RELEASE_TIMING
  );
}
