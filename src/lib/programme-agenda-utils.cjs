const DAY_ORDER = {
  oct6: 0,
  oct7: 1,
  oct8: 2,
};

function timeSortValue(time) {
  const match = String(time || '')
    .trim()
    .match(/^(\d{1,2}):(\d{2})/);

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

module.exports = {
  DAY_ORDER,
  timeSortValue,
  compareProgrammeSessions,
  sortProgrammeSessionsForAgenda,
};
