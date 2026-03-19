import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qlrwqiwcrcugmywbecwq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscndxaXdjcmN1Z215d2JlY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjcwNDQsImV4cCI6MjA4OTQ0MzA0NH0.C_ExmNPFtC8vbN6PS3hEpsDqU1Zmsl9wmHIdw9keTXQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch link template from database
export async function getLinkTemplate() {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("link")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching link template:", error);
      return null;
    }

    return data?.link || null;
  } catch (err) {
    console.error("Failed to fetch link template:", err);
    return null;
  }
}

// Update link template in database
export async function updateLinkTemplate(newTemplate) {
  try {
    const { data, error } = await supabase
      .from("settings")
      .update({ link: newTemplate })
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      console.error("Error updating link template:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to update link template:", err);
    return false;
  }
}

// Subscribe to real-time changes on settings table
export function subscribeToLinkChanges(callback) {
  const subscription = supabase
    .from("settings")
    .on("*", (payload) => {
      if (payload.new?.link) {
        callback(payload.new.link);
      }
    })
    .subscribe();

  return subscription;
}
