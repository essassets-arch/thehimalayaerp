export class SafeStorage {
  private static MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB

  static setItemString(key: string, serialized: string): boolean {
    try {
      if (serialized.length > this.MAX_SIZE) {
        console.warn(`Data for key "${key}" exceeds localStorage limit`);
        // We could compress here, but since it's already a string, 
        // we might just truncate or let it fail
      }
      
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.message?.includes('exceeded the quota')) {
        console.error('Storage quota exceeded, clearing old data...');
        this.handleQuotaExceeded();
        // Retry once after clearing
        try {
          window.localStorage.setItem(key, serialized);
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
  }

  static setItem(key: string, value: any): boolean {
    try {
      const serialized = JSON.stringify(value);
      
      if (serialized.length > this.MAX_SIZE) {
        console.warn(`Data for key "${key}" exceeds localStorage limit`);
        const compressed = this.compressData(value);
        window.localStorage.setItem(key, JSON.stringify(compressed));
        return true;
      }
      
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.message?.includes('exceeded the quota')) {
        this.handleQuotaExceeded();
        // Retry
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
  }

  private static compressData(data: any): any {
    if (data?.images) {
      data.images = data.images.map((img: any) => ({
        ...img,
        data: img.data?.substring(0, 1000)
      }));
    }
    return data;
  }

  private static handleQuotaExceeded() {
    try {
      const keys = Object.keys(window.localStorage);
      const sortedKeys = keys
        .filter(k => k.startsWith('erp_'))
        .sort((a, b) => {
          const timeA = parseInt(window.localStorage.getItem(`${a}_timestamp`) || '0');
          const timeB = parseInt(window.localStorage.getItem(`${b}_timestamp`) || '0');
          return timeA - timeB;
        });
      
      const toRemove = Math.max(1, Math.floor(sortedKeys.length * 0.3));
      for (let i = 0; i < toRemove; i++) {
        window.localStorage.removeItem(sortedKeys[i]);
      }
    } catch (e) {
      console.error('Failed to handle quota exceeded', e);
    }
  }
}
