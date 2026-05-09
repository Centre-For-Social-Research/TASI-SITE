const DEFAULT_LIST_TTL_MS = 60 * 1000;
const DEFAULT_DETAIL_TTL_MS = 2 * 60 * 1000;

function nowMs() {
  return Date.now();
}

function createMemoryCache({ ttlMs, getNow = nowMs } = {}) {
  const entries = new Map();
  const ttl = Number(ttlMs || 0);

  function set(key, value) {
    entries.set(String(key), {
      value,
      cachedAt: getNow(),
    });
  }

  function get(key, { maxAgeMs = ttl } = {}) {
    const entry = entries.get(String(key));
    if (!entry) return null;

    if (Number(maxAgeMs) > 0 && getNow() - entry.cachedAt > maxAgeMs) {
      entries.delete(String(key));
      return null;
    }

    return entry.value;
  }

  function deleteEntry(key) {
    entries.delete(String(key));
  }

  function clear() {
    entries.clear();
  }

  return {
    set,
    get,
    delete: deleteEntry,
    clear,
    size: () => entries.size,
  };
}

function applyRegistrationListCache(cache, key, value) {
  cache.set(key, value);
}

function readRegistrationListCache(cache, key) {
  return cache.get(key);
}

function applyRegistrationDetailCache(cache, registrationId, value) {
  cache.set(registrationId, value);
}

function readRegistrationDetailCache(cache, registrationId) {
  return cache.get(registrationId);
}

function invalidateRegistrationCaches({
  listCache,
  detailCache,
  registrationIds = [],
} = {}) {
  if (listCache) listCache.clear();

  if (detailCache) {
    for (const registrationId of registrationIds) {
      detailCache.delete(registrationId);
    }
  }
}

module.exports = {
  DEFAULT_LIST_TTL_MS,
  DEFAULT_DETAIL_TTL_MS,
  createMemoryCache,
  applyRegistrationListCache,
  readRegistrationListCache,
  applyRegistrationDetailCache,
  readRegistrationDetailCache,
  invalidateRegistrationCaches,
};
