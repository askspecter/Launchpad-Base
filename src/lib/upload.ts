/**
 * Client-side image upload for token logos.
 * Downscales to a square-ish max edge (keeps KV values small + logos crisp),
 * then stores via /api/upload and returns an absolute URL usable as the
 * on-chain `logo` (so it renders in the feed and wallets).
 */

const MAX_EDGE = 512;

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
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

async function toDownscaledDataUrl(file: File): Promise<string> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.drawImage(img, 0, 0, w, h);
  // PNG keeps transparency; fall back to JPEG for photos to stay small.
  const png = canvas.toDataURL("image/png");
  if (png.length < 400_000) return png;
  return canvas.toDataURL("image/jpeg", 0.85);
}

/** Upload a file and return an absolute URL to the stored image. */
export async function uploadLogo(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const dataUrl = await toDownscaledDataUrl(file);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed.");
  return `${window.location.origin}${json.path}`;
}
