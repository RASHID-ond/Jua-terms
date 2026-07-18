import { supabase } from "./supabaseClient";
import { optimizeImage, formatBytes } from "./imageOptimize";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]);
const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024; // 15MB, checked before optimization runs
const BUCKET = "site-assets";

export type UploadStage = "validating" | "compressing" | "uploading" | "done";

export interface UploadProgress {
  stage: UploadStage;
  percent: number; // best-effort; see note below
  message: string;
}

export interface UploadResult {
  url: string;
  originalSize: number;
  optimizedSize: number;
  reductionPercent: number;
  optimized: boolean;
}

// Uploads a File to the public "site-assets" bucket, running it through
// client-side WebP conversion/resizing/compression first (see imageOptimize.ts).
// Returns the public URL plus size stats for the "X% smaller" UI.
//
// A note on `percent` in progress callbacks: Supabase Storage's upload call
// doesn't expose real byte-level progress events in the browser, so the
// "uploading" stage reports a fixed midpoint rather than a live number.
// This is intentionally honest rather than faking a smooth progress bar that
// isn't measuring anything real.
export async function uploadImage(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  onProgress?.({ stage: "validating", percent: 5, message: "Checking file..." });

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Please upload a PNG, JPG, WEBP, GIF, or SVG image.");
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error(`File is too large (${formatBytes(file.size)}). Maximum allowed is 15MB.`);
  }

  onProgress?.({ stage: "compressing", percent: 25, message: "Optimizing image..." });
  const optimized = await optimizeImage(file);

  onProgress?.({
    stage: "uploading",
    percent: 65,
    message: optimized.skipped ? "Uploading..." : "Uploading optimized image..."
  });

  const path = `${Date.now()}_${optimized.fileName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, optimized.blob, {
    cacheControl: "3600",
    upsert: false,
    contentType: optimized.skipped ? file.type : "image/webp"
  });
  if (error) throw new Error(error.message);

  onProgress?.({ stage: "done", percent: 100, message: "Done" });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return {
    url: data.publicUrl,
    originalSize: optimized.originalSize,
    optimizedSize: optimized.optimizedSize,
    reductionPercent: optimized.reductionPercent,
    optimized: !optimized.skipped
  };
}
