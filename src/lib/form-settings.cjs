// Public forms that admins can open or close from Settings. A form with no
// row in form_settings is open, so a fresh database changes nothing.
const PUBLIC_FORMS = [
  { key: 'registration', label: 'Delegate registration', path: '/register' },
  {
    key: 'speaker_application',
    label: 'Speaker application',
    path: '/speaker-application',
  },
  {
    key: 'volunteer_application',
    label: 'Volunteer application',
    path: '/volunteer-application',
  },
  {
    key: 'media_accreditation',
    label: 'Media accreditation',
    path: '/media/accreditation',
  },
  {
    key: 'exhibition_enquiry',
    label: 'Exhibition enquiry',
    path: '/exhibition',
  },
];

const FORM_CLOSED_MESSAGE = 'Registrations for TASI 2026 are now closed.';

function isPublicFormKey(key) {
  return PUBLIC_FORMS.some((form) => form.key === key);
}

// Merges stored rows over the defaults. Unknown keys are ignored.
function buildFormStatuses(rows) {
  const byKey = new Map((rows || []).map((row) => [row.form_key, row]));
  return PUBLIC_FORMS.map((form) => {
    const row = byKey.get(form.key);
    return {
      ...form,
      open: row ? row.is_open !== false : true,
      updatedBy: row?.updated_by_email || null,
      updatedAt: row?.updated_at || null,
    };
  });
}

module.exports = {
  PUBLIC_FORMS,
  FORM_CLOSED_MESSAGE,
  isPublicFormKey,
  buildFormStatuses,
};
