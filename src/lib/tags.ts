// Cache tags. Public pages tag the data they read; admin saves expire the matching tags,
// so the website shows a change straight after it is saved.
export const TAGS = {
  settings: "settings",
  posts: "posts",
  events: "events",
  team: "team",
  prayer: "prayer",
  jumuah: "jumuah",
  donations: "donations",
} as const;
