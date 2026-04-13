export function splitPipeList(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAttendeeInitials(name) {
  if (!name) {
    return 'AT';
  }

  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function getAttendeeCategoryLabel(category) {
  return category?.trim() || 'Uncategorised';
}

export function getAttendeeBucket(category = '', events = []) {
  const label = `${category} ${events.join(' ')}`.toLowerCase();

  if (
    label.includes('speaker') ||
    label.includes('panelist') ||
    label.includes('keynote')
  ) {
    return 'Speaker';
  }

  if (
    label.includes('media') ||
    label.includes('press') ||
    label.includes('journal')
  ) {
    return 'Media';
  }

  if (
    label.includes('sponsor') ||
    label.includes('partner') ||
    label.includes('host') ||
    label.includes('embassy')
  ) {
    return 'Partner';
  }

  return 'Delegate';
}

export function getBucketClasses(bucket) {
  switch (bucket) {
    case 'Speaker':
      return 'border-fuchsia-300/70 bg-fuchsia-500/10 text-fuchsia-800 dark:border-fuchsia-500/50 dark:bg-fuchsia-500/15 dark:text-fuchsia-200';
    case 'Media':
      return 'border-sky-300/70 bg-sky-500/10 text-sky-800 dark:border-sky-500/50 dark:bg-sky-500/15 dark:text-sky-200';
    case 'Partner':
      return 'border-amber-300/70 bg-amber-500/10 text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/15 dark:text-amber-200';
    default:
      return 'border-emerald-300/70 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-200';
  }
}

export function matchesAttendeeSearch(attendee, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    attendee.name,
    attendee.organisation,
    attendee.designation,
    attendee.notes,
    ...(attendee.events ?? []),
    ...(attendee.source ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}
