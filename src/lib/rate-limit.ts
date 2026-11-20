// A small safety net against bots that hammer a form: each visitor address gets a few tries per window.
// It lives in the server's memory, so it is a speed bump, not a wall. The hidden "website" field catches the simplest bots.
const hits = new Map<string, number[]>();

export function tooMany(req: Request, key: string, limit = 6, windowMs = 10 * 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(id, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return recent.length > limit;
}
