const base = process.env.WP_BASE_URL;

export async function wp<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const auth = Buffer.from(
    `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`,
  ).toString("base64");
  const res = await fetch(`${base}/wp-json/wp/v2${path}`, {
    ...init,
    headers: { Authorization: `Basic ${auth}`, ...init?.headers },
  });
  if (!res.ok) throw new Error(`WordPress ${res.status}: ${path}`);
  return res.json();
}
