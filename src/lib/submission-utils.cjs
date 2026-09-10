const SUBMISSION_TYPES = {
  speaker: { label: 'Speakers', source: 'speaker-application' },
  volunteer: { label: 'Volunteers', source: 'volunteer-application' },
  media: { label: 'Media', source: 'media-accreditation' },
  exhibition: { label: 'Exhibition enquiries', source: 'exhibition-enquiry' },
  newsletter: { label: 'Newsletter', table: 'newsletter_subscribers' },
  confirmation: {
    label: 'Confirmation requests',
    table: 'registration_confirmation_requests',
  },
};

const MULTILINE_LABELS = new Set(['Pitch', 'Motivation', 'Enquiry details']);

function normalizeSubmissionType(value) {
  const type = String(value || '').toLowerCase();
  return Object.hasOwn(SUBMISSION_TYPES, type) ? type : 'speaker';
}

function parseMessageFields(message) {
  const lines = String(message || '')
    .replace(/\r/g, '')
    .split('\n');
  const fields = [];
  let multiline = null;

  for (const rawLine of lines.slice(1)) {
    const line = rawLine.trim();
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const label = match[1].trim();
      const value = match[2].trim();
      if (MULTILINE_LABELS.has(label) && !value) {
        multiline = { label, values: [] };
        fields.push(multiline);
      } else {
        fields.push({ label, value });
        multiline = null;
      }
    } else if (line && multiline) {
      multiline.values.push(line);
    }
  }

  return fields.map((field) => ({
    label: field.label,
    value: field.values ? field.values.join('\n') : field.value,
  }));
}

function fieldValue(fields, label) {
  return fields.find((field) => field.label === label)?.value || '';
}

function normalizeContactSubmission(record, type) {
  const fields = parseMessageFields(record.message);
  const name = fieldValue(fields, 'Name') || record.email || 'Unknown';
  const context =
    fieldValue(fields, 'Organization') ||
    fieldValue(fields, 'Publication') ||
    fieldValue(fields, 'Company') ||
    fieldValue(fields, 'Suggested topic') ||
    '';

  return {
    id: String(record.id),
    type,
    name,
    email:
      fieldValue(fields, 'Email') ||
      fieldValue(fields, 'Business email') ||
      record.email ||
      '',
    context,
    source: record.source || SUBMISSION_TYPES[type]?.source || '',
    createdAt: record.created_at,
    fields,
    rawMessage: record.message || '',
  };
}

function normalizeStructuredSubmission(record, type) {
  const date =
    type === 'newsletter' ? record.subscribed_at : record.requested_at;
  const fields = [
    { label: 'Email', value: record.email || '' },
    { label: 'Source', value: record.source || '' },
  ];
  if (type === 'newsletter') {
    fields.splice(1, 0, { label: 'Status', value: record.status || '' });
  }
  return {
    id: String(record.id),
    type,
    name: record.email || 'Unknown',
    email: record.email || '',
    context: type === 'newsletter' ? record.status || '' : record.source || '',
    source: record.source || '',
    createdAt: date,
    fields,
    rawMessage: '',
  };
}

function submissionToExportRow(item) {
  const row = {
    ID: item.id,
    Category: SUBMISSION_TYPES[item.type]?.label || item.type,
    Name: item.name,
    Email: item.email,
    Context: item.context,
    Source: item.source,
    'Submitted at': item.createdAt,
  };
  for (const field of item.fields || []) {
    if (!Object.hasOwn(row, field.label)) row[field.label] = field.value;
  }
  if (item.rawMessage) row['Original submission'] = item.rawMessage;
  return row;
}

module.exports = {
  SUBMISSION_TYPES,
  normalizeSubmissionType,
  parseMessageFields,
  normalizeContactSubmission,
  normalizeStructuredSubmission,
  submissionToExportRow,
};
