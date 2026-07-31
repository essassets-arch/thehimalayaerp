// Version 5 — bump when schema changes to force re-seed from mockData
const MOCK_DB_VERSION = 5;

export function getUserEmail() {
  if (typeof window === 'undefined') return null;
  try {
    const authRaw = localStorage.getItem('auth-storage');
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      return parsed?.state?.user?.email || parsed?.state?.user?.id || null;
    }
  } catch (e) {}
  return null;
}

export function getStorageKey() {
  if (typeof window === 'undefined') return `himalaya_erp_mock_db_v${MOCK_DB_VERSION}`;
  const email = getUserEmail();
  if (email) {
    return `himalaya_erp_mock_db_v${MOCK_DB_VERSION}_${email}`;
  }
  return `himalaya_erp_mock_db_v${MOCK_DB_VERSION}`;
}
/** Clear legacy storage keys to free up browser quota space */
function clearLegacyKeys() {
  if (typeof window === 'undefined') return;
  try {
    for (let i = 1; i < MOCK_DB_VERSION; i++) {
      localStorage.removeItem(`himalaya_erp_mock_db_v${i}`);
    }
    localStorage.removeItem('himalaya_erp_mock_db');
  } catch (e) {
    // ignore
  }
}

/** Recursively prunes/truncates large base64 data URIs (>30KB) to prevent QuotaExceededError */
function pruneLargeDataURIs(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(pruneLargeDataURIs);
  }
  const newObj: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && val.startsWith('data:') && val.length > 30000) {
      newObj[key] = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-size="10">Saved Attachment</text></svg>';
    } else if (typeof val === 'object' && val !== null) {
      newObj[key] = pruneLargeDataURIs(val);
    } else {
      newObj[key] = val;
    }
  }
  return newObj;
}

export function getMockStorage(initialData: any) {
  if (typeof window === 'undefined') return initialData;

  clearLegacyKeys();

  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === MOCK_DB_VERSION && parsed.data) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.error('[MockStorage] Failed to parse stored data', e);
  }

  // No valid stored data — hydrate from seed
  persistMockStorage(initialData);
  return initialData;
}

export function persistMockStorage(data: any) {
  if (typeof window === 'undefined') return;
  clearLegacyKeys();

  const payload = {
    version: MOCK_DB_VERSION,
    data,
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(payload));
  } catch (e: any) {
    console.warn('[MockStorage] Storage quota error caught. Pruning large attachments...', e);
    try {
      const prunedData = pruneLargeDataURIs(data);
      const prunedPayload = {
        version: MOCK_DB_VERSION,
        data: prunedData,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(prunedPayload));
    } catch (err2) {
      console.error('[MockStorage] Fallback to sessionStorage due to quota limit', err2);
      try {
        sessionStorage.setItem(getStorageKey(), JSON.stringify(payload));
      } catch (err3) {
        console.error('[MockStorage] Memory-only fallback active', err3);
      }
    }
  }
}

export function resetMockStorage() {
  if (typeof window !== 'undefined') {
    clearLegacyKeys();
    localStorage.removeItem(getStorageKey());
    sessionStorage.removeItem(getStorageKey());
  }
}
