const DB_NAME = 'HimalayaEmployeeDB';
const DB_VERSION = 1;
const STORE_NAME = 'employee_documents';

/**
 * Initializes the IndexedDB database
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this platform.'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Saves a Blob in IndexedDB under a specific storage key
 */
export async function saveFile(key: string, file: Blob): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(file, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Retrieves a Blob from IndexedDB by its storage key
 */
export async function getFile(key: string): Promise<Blob | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Deletes a Blob from IndexedDB by its storage key
 */
export async function deleteFile(key: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Clears all file Blobs whose key starts with a specific prefix (e.g., 'draft_')
 */
export async function clearFilesByPrefix(prefix: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Open cursor to scan keys
    const request = store.openKeyCursor();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = (event) => {
      const cursor = request.result;
      if (cursor) {
        const key = cursor.primaryKey as string;
        if (key.startsWith(prefix)) {
          store.delete(key);
        }
        cursor.continue();
      } else {
        resolve();
      }
    };
  });
}
