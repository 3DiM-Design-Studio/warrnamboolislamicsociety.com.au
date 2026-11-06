import { Bell, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { posts } from "@/content/site";

export const metadata = { title: "News" };

export default function News() {
  return (
    <PageShell
      title="Stories and updates from our community."
      crumb="News"
      highlight="our community"
      icons={{
        stories: <BookOpen className="size-[0.75em]" aria-hidden />,
        updates: <Bell className="size-[0.75em]" aria-hidden />,
        community: <Users className="size-[0.75em]" aria-hidden />,
      }}
      intro="Announcements, events and notices from Warrnambool Islamic Society."
    >
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/news/${p.slug}`}
              className="block p-4 hover:bg-background"
            >
              <p className="text-xs text-muted">{p.date}</p>
              <p className="font-medium">{p.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
