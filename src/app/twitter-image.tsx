import { shareImage } from "@/lib/share-image";

export const alt = "Warrnambool Islamic Society";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return shareImage();
}
