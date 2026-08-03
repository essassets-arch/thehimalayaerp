export class SafeStorage {
  private static MAX_SIZE = 3.5 * 1024 * 1024; // 3.5MB per key safeguard
  private static isQuotaHandling = false;

  static setItemString(key: string, serialized: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      let dataToSave = serialized;
      if (dataToSave.length > this.MAX_SIZE) {
        console.warn(`Data for key "${key}" is large (${(dataToSave.length / 1024 / 1024).toFixed(2)}MB). Trimming heavy payloads.`);
        dataToSave = this.stripHeavyPayloadsFromString(dataToSave);
      }
      
      window.localStorage.setItem(key, dataToSave);
      window.localStorage.setItem(`${key}_timestamp`, Date.now().toString());
      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.message?.includes('exceeded the quota')) {
        if (!this.isQuotaHandling) {
          this.isQuotaHandling = true;
          console.warn(`[SafeStorage] Storage quota reached while saving "${key}". Clearing old cached data...`);
          this.handleQuotaExceeded(key);
          this.isQuotaHandling = false;
        }
        
        // Retry once with stripped payload after clearing quota
        try {
          const stripped = this.stripHeavyPayloadsFromString(serialized);
          window.localStorage.setItem(key, stripped);
          window.localStorage.setItem(`${key}_timestamp`, Date.now().toString());
          return true;
        } catch (e) {
          console.warn(`[SafeStorage] Could not persist key "${key}" due to browser storage limits.`);
          return false;
        }
      }
      return false;
    }
  }

  static setItem(key: string, value: any): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const serialized = JSON.stringify(value);
      return this.setItemString(key, serialized);
    } catch (error: any) {
      return false;
    }
  }

  private static stripHeavyPayloadsFromString(raw: string): string {
    if (!raw) return raw;
    // Replace huge inline data URIs (e.g. data:image/png;base64,...) with a placeholder
    return raw.replace(/data:image\/[a-zA-Z]+;base64,[^"'\s]+/g, 'data:image/svg+xml;utf8,<svg></svg>');
  }

  private static handleQuotaExceeded(currentKey?: string) {
    try {
      const keys = Object.keys(window.localStorage);
      
      // Clean up orphaned timestamp keys first
      keys.forEach(k => {
        if (k.endsWith('_timestamp')) {
          const baseKey = k.replace(/_timestamp$/, '');
          if (!window.localStorage.getItem(baseKey)) {
            window.localStorage.removeItem(k);
          }
        }
      });

      // Essential system keys that should NOT be evicted
      const PROTECTED_KEYS = ['auth-storage', 'himalaya-material-flow-cleanup-version', 'himalaya-transactional-reset-version'];
      
      const candidateKeys = keys
        .filter(k => !k.endsWith('_timestamp') && !PROTECTED_KEYS.includes(k) && k !== currentKey)
        .map(k => ({
          key: k,
          size: window.localStorage.getItem(k)?.length || 0,
          timestamp: parseInt(window.localStorage.getItem(`${k}_timestamp`) || '0')
        }))
        .sort((a, b) => {
          // Priority 1: Largest payload first; Priority 2: Oldest timestamp
          if (b.size !== a.size) return b.size - a.size;
          return a.timestamp - b.timestamp;
        });

      // Remove top 40% largest/oldest cache keys
      const toRemoveCount = Math.max(1, Math.ceil(candidateKeys.length * 0.4));
      for (let i = 0; i < toRemoveCount && i < candidateKeys.length; i++) {
        const item = candidateKeys[i];
        window.localStorage.removeItem(item.key);
        window.localStorage.removeItem(`${item.key}_timestamp`);
      }
    } catch (e) {
      console.warn('Failed to prune storage quota', e);
    }
  }
}

