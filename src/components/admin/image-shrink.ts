/**
 * Shrinks a picture in the browser before it is sent, so phone photos (often 5 to 10 MB) upload quickly and stay under
 * the size the host accepts. The server then tidies and resizes it again. Throws when the browser cannot read the file,
 * for example an iPhone HEIC picture on some computers.
 */
export async function shrinkImage(file: File, maxSide = 2000): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const toBlob = (quality: number) => new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("resize failed"))), "image/jpeg", quality));
  let blob = await toBlob(0.85);
  // Almost never needed, but a very detailed picture may still be large: lower the quality until it fits.
  for (const q of [0.75, 0.65, 0.5]) {
    if (blob.size <= 3.6 * 1024 * 1024) break;
    blob = await toBlob(q);
  }
  return blob;
}
