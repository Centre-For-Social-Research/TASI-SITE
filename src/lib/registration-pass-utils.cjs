function normalizeEntryPasses(entryPasses) {
  if (Array.isArray(entryPasses)) {
    return entryPasses.filter(Boolean);
  }

  if (!entryPasses) {
    return [];
  }

  return [entryPasses];
}

function getIssuedEntryPass(entryPasses) {
  return (
    normalizeEntryPasses(entryPasses).find(
      (item) => item?.status === 'issued'
    ) || null
  );
}

function normalizeRegistrationRecord(registration) {
  if (!registration || typeof registration !== 'object') {
    return registration;
  }

  return {
    ...registration,
    entry_passes: normalizeEntryPasses(registration.entry_passes),
  };
}

function buildPassImageStoragePath({ passId, registrationId }) {
  const normalizedPassId = String(passId || '').trim();
  const normalizedRegistrationId = String(registrationId || '').trim();

  if (!normalizedPassId || !normalizedRegistrationId) {
    return '';
  }

  return `${normalizedRegistrationId}/pass-${normalizedPassId}.png`;
}

module.exports = {
  buildPassImageStoragePath,
  normalizeEntryPasses,
  getIssuedEntryPass,
  normalizeRegistrationRecord,
};
