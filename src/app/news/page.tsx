import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { posts } from "@/content/site";

export const metadata = { title: "News" };

export default function News() {
  return (
    <PageShell title="News">
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/news/${p.slug}`} className="block p-4 hover:bg-background">
              <p className="text-xs text-muted">{p.date}</p>
              <p className="font-medium">{p.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
