// Client-side image optimization, run entirely in the browser before anything
// is uploaded to Supabase Storage. This avoids needing a separate backend
// service just to resize/compress images.

export interface OptimizeResult {
  blob: Blob;
  fileName: string;
  originalSize: number;
  optimizedSize: number;
  reductionPercent: number;
  skipped: boolean; // true for formats we deliberately leave untouched (see below)
}

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 0.8;

// SVGs are vector — rasterizing them to WebP would make them worse (loses
// infinite scalability, and they're already tiny). GIFs are skipped too:
// canvas-based resizing only captures a single frame, which would silently
// destroy any animation. Both are stored as-is, unoptimized.
function shouldSkipOptimization(file: File): boolean {
  return file.type === "image/svg+xml" || file.type === "image/gif";
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image file. It may be corrupted."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image compression failed."));
      },
      type,
      quality
    );
  });
}

// Resizes (never upscales) to a max width of 1200px, converts to WebP at 80%
// quality. Returns the optimized blob plus size stats so the UI can show a
// reduction percentage.
export async function optimizeImage(file: File): Promise<OptimizeResult> {
  const originalSize = file.size;

  if (shouldSkipOptimization(file)) {
    return {
      blob: file,
      fileName: file.name,
      originalSize,
      optimizedSize: originalSize,
      reductionPercent: 0,
      skipped: true
    };
  }

  const img = await loadImage(file);

  const scale = Math.min(1, MAX_WIDTH / img.width); // never upscale
  const targetWidth = Math.round(img.width * scale);
  const targetHeight = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser doesn't support in-browser image processing.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);

  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9.\-_]/g, "");
  const optimizedSize = blob.size;
  const reductionPercent = originalSize > 0
    ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))
    : 0;

  return {
    blob,
    fileName: `${baseName}.webp`,
    originalSize,
    optimizedSize,
    reductionPercent,
    skipped: false
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
