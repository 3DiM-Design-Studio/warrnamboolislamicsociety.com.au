import { Bell, BookOpen, Users } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { FeaturedPost, PostCard } from "@/components/story-cards";
import { getPosts } from "@/lib/content";

export const metadata = { title: "News" };

export default async function News() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;
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
      {!lead ? (
        <p className="text-muted">No news yet. Please check back soon.</p>
      ) : (
        <div className="space-y-10">
          <FeaturedPost post={lead} />
          {rest.length > 0 && (
            <section>
              <h2 className="mb-5 text-2xl font-bold">Latest news</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
}
