/**
 * Settings Sync using Supabase
 * Data tersinkronisasi di semua device secara real-time
 */

import { supabase } from './supabaseClient';

const TABLE_NAME = 'settings';

const DEFAULT_SETTINGS = {
  id: 1,
  title: "Selamat! Kamu Menang! 🎉",
  subtitle: "Ini adalah link khusus kamu:",
  link: "https://example.com",
  updated_at: new Date().toISOString()
};

// Get settings from Supabase
export async function getSettings() {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error("Error getting settings:", error);
      return DEFAULT_SETTINGS;
    }

    return data || DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to get settings:", error);
    return DEFAULT_SETTINGS;
  }
}

// Update settings in Supabase
export async function updateSettings(updates) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      console.error("Error updating settings:", error);
      throw error;
    }

    // Broadcast event untuk local listeners
    window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: data }));

    return data;
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw error;
  }
}

// Reset to default settings
export async function resetSettings() {
  return updateSettings({
    title: DEFAULT_SETTINGS.title,
    subtitle: DEFAULT_SETTINGS.subtitle,
    link: DEFAULT_SETTINGS.link
  });
}

// Listen to real-time changes dari Supabase
export function listenToSettings(callback) {
  try {
    // Subscribe to changes
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLE_NAME,
          filter: 'id=eq.1'
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
    };
  } catch (error) {
    console.error("Failed to setup listener:", error);
    // Return dummy function jika error
    return () => {};
  }
}
