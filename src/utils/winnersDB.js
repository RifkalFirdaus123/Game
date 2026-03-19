/**
 * Winners Database using IndexedDB
 * Stores winner data and syncs across tabs via events
 */

const DB_NAME = "gauntlet_winners_db";
const STORE_NAME = "winners";
const DB_VERSION = 1;

// Initialize database
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("name", "name", { unique: false });
      }
    };
  });
}

// Add winner
export async function addWinner(name, link) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  
  const winner = {
    name,
    link,
    timestamp: new Date().toISOString(),
    status: "active" // active, verified, archived
  };

  return new Promise((resolve, reject) => {
    const request = store.add(winner);
    request.onsuccess = () => {
      resolve({ id: request.result, ...winner });
      // Broadcast to other tabs
      window.dispatchEvent(new CustomEvent('winnersDBUpdated', { detail: { action: 'add', data: { id: request.result, ...winner } } }));
    };
    request.onerror = () => reject(request.error);
  });
}

// Get all winners
export async function getAllWinners() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const index = store.index("timestamp");

  return new Promise((resolve, reject) => {
    const request = index.getAll();
    request.onsuccess = () => {
      // Sort by timestamp descending (newest first)
      resolve(request.result.reverse());
    };
    request.onerror = () => reject(request.error);
  });
}

// Update winner
export async function updateWinner(id, updates) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const winner = { ...getRequest.result, ...updates };
      const updateRequest = store.put(winner);
      updateRequest.onsuccess = () => {
        resolve(winner);
        // Broadcast to other tabs
        window.dispatchEvent(new CustomEvent('winnersDBUpdated', { detail: { action: 'update', data: winner } }));
      };
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Delete winner
export async function deleteWinner(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => {
      resolve();
      // Broadcast to other tabs
      window.dispatchEvent(new CustomEvent('winnersDBUpdated', { detail: { action: 'delete', data: { id } } }));
    };
    request.onerror = () => reject(request.error);
  });
}

// Clear all winners
export async function clearAllWinners() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => {
      resolve();
      window.dispatchEvent(new CustomEvent('winnersDBUpdated', { detail: { action: 'clear' } }));
    };
    request.onerror = () => reject(request.error);
  });
}
