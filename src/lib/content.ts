import { supabase } from "./supabaseClient";

export type ContentMap = Record<string, any>;

// Fetches every content section and returns it as a single object, e.g.
// { siteSettings: {...}, about: {...}, team: {...}, ... } — same shape the
// old /api/content endpoint used to return, so page components didn't need
// to change how they read the data, only how they fetch it.
export async function fetchContent(): Promise<ContentMap> {
  const { data, error } = await supabase.from("content").select("key, value");
  if (error) throw error;

  const result: ContentMap = {};
  for (const row of data || []) {
    result[row.key] = row.value;
  }
  return result;
}

// Admin-only: saves one or more content sections at once, e.g.
// saveContent({ siteSettings: {...} }) or saveContent({ about: {...}, footer: {...} }).
// Blocked server-side by Row Level Security unless the caller is a logged-in admin.
export async function saveContent(partial: ContentMap): Promise<void> {
  const rows = Object.entries(partial).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from("content").upsert(rows, { onConflict: "key" });
  if (error) throw error;
}
