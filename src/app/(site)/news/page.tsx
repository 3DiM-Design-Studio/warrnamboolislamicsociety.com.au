import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getPosts } from "@/lib/content";

export const metadata = { title: "News" };

export default async function News() {
  const posts = await getPosts();
  return (
    <PageShell title="News">
      {posts.length === 0 ? (
        <p className="text-muted">No news yet. Please check back soon.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/news/${p.slug}`} className="block p-4 hover:bg-background">
                <p className="text-xs text-muted">{p.post_date}</p>
                <p className="font-medium">{p.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
