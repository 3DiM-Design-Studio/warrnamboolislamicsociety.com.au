import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Search engines may read the public pages. The admin, the API and the "thank you" pages are kept out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/donate/thank-you", "/membership/thank-you", "/unsubscribe"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
