/**
 * Settings Sync using Firebase Realtime Database
 * Data tersinkronisasi di semua device secara real-time
 */

import { db, ref, get, set, onValue, off } from './firebaseConfig';

const SETTINGS_PATH = 'gauntlet/settings';

const DEFAULT_SETTINGS = {
  title: "Selamat! Kamu Menang! 🎉",
  subtitle: "Ini adalah link khusus kamu:",
  link: "https://example.com",
  updatedAt: new Date().toISOString()
};

// Get settings from Firebase
export async function getSettings() {
  try {
    const snapshot = await get(ref(db, SETTINGS_PATH));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to get settings from Firebase:", error);
    // Fallback ke default jika Firebase error
    return DEFAULT_SETTINGS;
  }
}

// Update settings in Firebase
export async function updateSettings(updates) {
  try {
    const currentSettings = await getSettings();
    const newSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await set(ref(db, SETTINGS_PATH), newSettings);
    
    // Broadcast event untuk local listeners
    window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: newSettings }));
    
    return newSettings;
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw error;
  }
}

// Reset to default settings
export async function resetSettings() {
  try {
    await set(ref(db, SETTINGS_PATH), DEFAULT_SETTINGS);
    window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: DEFAULT_SETTINGS }));
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to reset settings:", error);
    throw error;
  }
}

// Listen to real-time changes dari Firebase
export function listenToSettings(callback) {
  try {
    const dbRef = ref(db, SETTINGS_PATH);
    
    const listener = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(DEFAULT_SETTINGS);
      }
    }, (error) => {
      console.error("Error listening to settings:", error);
      // Fallback ke default jika ada error
      callback(DEFAULT_SETTINGS);
    });
    
    // Return unsubscribe function
    return () => off(dbRef);
  } catch (error) {
    console.error("Failed to setup listener:", error);
    // Return dummy function jika error
    return () => {};
  }
}
