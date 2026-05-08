const DAY_ORDER = {
  oct6: 0,
  oct7: 1,
  oct8: 2,
};

function normalizePersonName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/\b(dr|mr|mrs|ms|smt|shri|professor|prof|phd)\.?\b/g, ' ')
    .replace(/^moderator:\s*/i, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveMappedPersonValue(name, valueMap = {}) {
  const normalized = normalizePersonName(name);
  if (valueMap[normalized]) {
    return valueMap[normalized];
  }

  const compressed = normalized.replace(/\s+/g, '');
  const fallbackKey = Object.keys(valueMap).find(
    (key) => key.replace(/\s+/g, '') === compressed
  );

  return fallbackKey ? valueMap[fallbackKey] : '';
}

function shouldShowProgrammeSession(session) {
  const title = String(session?.title || '')
    .trim()
    .toLowerCase();

  return title !== 'emcee' && title !== 'registration + tea/coffee';
}

function timeSortValue(time) {
  const normalized = String(time || '').replace(/[\u2013\u2014]/g, '-');
  const match = normalized.trim().match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return 0;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function compareProgrammeSessions(left = {}, right = {}) {
  const dayDelta =
    (DAY_ORDER[left.day] ?? Number.MAX_SAFE_INTEGER) -
    (DAY_ORDER[right.day] ?? Number.MAX_SAFE_INTEGER);

  if (dayDelta !== 0) {
    return dayDelta;
  }

  const timeDelta = timeSortValue(left.time) - timeSortValue(right.time);
  if (timeDelta !== 0) {
    return timeDelta;
  }

  return String(left.title || '').localeCompare(String(right.title || ''));
}

function sortProgrammeSessionsForAgenda(sessions = []) {
  return [...sessions].sort(compareProgrammeSessions);
}

function buildProgrammeSessionViewModels({
  sessions = [],
  speakerDesignationMap = {},
  speakerPhotoMap = {},
} = {}) {
  return sessions.filter(shouldShowProgrammeSession).map((session) => ({
    ...session,
    topic: session.description || '',
    speakersDetailed: (session.speakers || []).map((speakerName) => ({
      name: speakerName,
      title: resolveMappedPersonValue(speakerName, speakerDesignationMap),
      photo: resolveMappedPersonValue(speakerName, speakerPhotoMap),
      mod: false,
    })),
  }));
}

module.exports = {
  DAY_ORDER,
  buildProgrammeSessionViewModels,
  timeSortValue,
  compareProgrammeSessions,
  normalizePersonName,
  resolveMappedPersonValue,
  shouldShowProgrammeSession,
  sortProgrammeSessionsForAgenda,
};
