/**
 * Game Settings Database using IndexedDB
 * Stores game display settings (title, subtitle, link) that all users see
 */

const DB_NAME = "gauntlet_settings_db";
const STORE_NAME = "settings";
const DB_VERSION = 1;

const DEFAULT_SETTINGS = {
  id: 1,
  title: "Selamat! Kamu Menang! 🎉",
  subtitle: "Ini adalah link khusus kamu:",
  link: "https://example.com",
  updatedAt: new Date().toISOString()
};

// Initialize database
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.add(DEFAULT_SETTINGS);
      }
    };
  });
}

// Get settings
export async function getSettings() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(1);
    request.onsuccess = () => {
      resolve(request.result || DEFAULT_SETTINGS);
    };
    request.onerror = () => reject(request.error);
  });
}

// Update settings
export async function updateSettings(updates) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(1);
    getRequest.onsuccess = () => {
      const settings = {
        ...getRequest.result,
        ...updates,
        id: 1,
        updatedAt: new Date().toISOString()
      };
      const updateRequest = store.put(settings);
      updateRequest.onsuccess = () => {
        resolve(settings);
        // Broadcast to other tabs/devices
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
      };
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Reset to defaults
export async function resetSettings() {
  return updateSettings(DEFAULT_SETTINGS);
}
