import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Lets a phone offer "Add to home screen" with the society's icon and colours.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.short,
    description: site.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f0",
    theme_color: "#0b0d0b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
