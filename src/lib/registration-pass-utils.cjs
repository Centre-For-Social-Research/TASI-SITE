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
  return normalizeEntryPasses(entryPasses).find((item) => item?.status === "issued") || null;
}

function normalizeRegistrationRecord(registration) {
  if (!registration || typeof registration !== "object") {
    return registration;
  }

  return {
    ...registration,
    entry_passes: normalizeEntryPasses(registration.entry_passes),
  };
}

module.exports = {
  normalizeEntryPasses,
  getIssuedEntryPass,
  normalizeRegistrationRecord,
};
