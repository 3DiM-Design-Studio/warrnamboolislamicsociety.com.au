import QRCode from "qrcode";

/** A QR code drawn as a small picture on the server, so it always matches the link saved in the admin panel. */
export function QrCode({ value, label, className }: { value: string; label: string; className?: string }) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const data = qr.modules.data;
  const quiet = 4; // the white border a phone camera needs around the code
  let path = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (data[y * n + x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
  return (
    <svg viewBox={`0 0 ${n + quiet * 2} ${n + quiet * 2}`} role="img" aria-label={label} shapeRendering="crispEdges" className={className}>
      <rect width="100%" height="100%" fill="#ffffff" />
      <path d={path} fill="#0a0c09" />
    </svg>
  );
}
