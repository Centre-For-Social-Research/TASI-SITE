import { EVENT_CONFIG } from '@/lib/registration-constants';

function formatOptional(value) {
  return value || 'Not specified';
}

export function buildTeamNotificationEmail(application) {
  const subject = `Media accreditation request — ${application.publication}`;
  const text = [
    `A new media accreditation request has come in for ${EVENT_CONFIG.shortName}.`,
    '',
    `Name: ${application.name}`,
    `Publication: ${application.publication}`,
    `Outlet type: ${application.outletType}`,
    `Business email: ${application.email}`,
    `Phone: ${application.phone}`,
    `Intends to cover: ${formatOptional(application.coverageDays)}`,
    '',
    'Reply directly to this email to reach the applicant.',
  ].join('\n');

  return { subject, text };
}

export function buildApplicantConfirmationEmail(application) {
  const firstName = application.name.split(' ')[0] || 'there';
  const subject = `We have received your ${EVENT_CONFIG.shortName} media accreditation request`;
  const text = [
    `Hi ${firstName},`,
    '',
    `Thank you for applying for media accreditation to the ${EVENT_CONFIG.name}, taking place on 14 and 15 October 2026 in New Delhi.`,
    '',
    'Here is what we have on record:',
    `Name: ${application.name}`,
    `Publication: ${application.publication}`,
    `Outlet type: ${application.outletType}`,
    `Email: ${application.email}`,
    `Phone: ${application.phone}`,
    `Intends to cover: ${formatOptional(application.coverageDays)}`,
    '',
    'Our team reviews every request individually. We will write back with a decision and, if approved, your press access details and the on-site media desk timings.',
    '',
    'If anything above is wrong, or you would like to add a colleague from the same newsroom, just reply to this email.',
    '',
    'Warm regards,',
    `The ${EVENT_CONFIG.shortName} media team`,
  ].join('\n');

  return { subject, text };
}
