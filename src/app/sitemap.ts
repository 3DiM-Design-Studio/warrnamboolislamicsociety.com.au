import type { MetadataRoute } from "next";
import { getPosts, getUpcomingEvents } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";

const pages = ["", "/about", "/prayer-times", "/news", "/events", "/membership", "/donate", "/contact", "/acnc", "/privacy-policy"];

// Every public page, plus each published news story and upcoming event, so search engines find new ones by themselves.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, events] = await Promise.all([getPosts().catch(() => []), getUpcomingEvents().catch(() => [])]);
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: p === "" || p === "/news" || p === "/events" ? ("weekly" as const) : ("monthly" as const), priority: p === "" ? 1 : 0.7 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/news/${p.slug}`, lastModified: p.post_date, changeFrequency: "yearly" as const, priority: 0.5 })),
    ...events.map((e) => ({ url: `${SITE_URL}/events/${e.id}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
