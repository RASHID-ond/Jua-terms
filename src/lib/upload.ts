import { supabase } from "./supabaseClient";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET = "site-assets";

// Uploads a File to the public "site-assets" bucket and returns its public URL.
// Row Level Security on storage.objects blocks this for anyone who isn't a
// logged-in admin, so the auth check happens server-side (in Supabase), not
// just in this client-side validation.
export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Please upload a PNG, JPG, WEBP, GIF, or SVG image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Image is too large. Maximum allowed size is ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.`);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
  const path = `${Date.now()}_${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
