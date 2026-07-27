/**
 * Lightweight in-memory cache layer for rarely changing configuration data.
 */

const cacheStore = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export const apiCache = {
  get: (key) => {
    const entry = cacheStore.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      cacheStore.delete(key);
      return null;
    }
    return entry.data;
  },

  set: (key, data) => {
    cacheStore.set(key, {
      timestamp: Date.now(),
      data
    });
  },

  clear: (key = null) => {
    if (key) {
      cacheStore.delete(key);
    } else {
      cacheStore.clear();
    }
  }
};
