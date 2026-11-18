import { Bell, BookOpen, Users } from "lucide-react";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { Pagination } from "@/components/pagination";
import { CardsSkeleton, FeaturedPostSkeleton, Skeleton } from "@/components/skeletons";
import { FeaturedPost, PostCard } from "@/components/story-cards";
import { getPosts } from "@/lib/content";

export const metadata = { title: "News" };

const PER_PAGE = 6;

// Reads ?page= from the address. The first page also shows the newest story large at the top.
async function NewsList({ searchParams }: { searchParams: PageProps<"/news">["searchParams"] }) {
  const [posts, query] = await Promise.all([getPosts(), searchParams]);
  const [lead, ...rest] = posts;
  if (!lead) return <p className="text-muted">No news yet. Please check back soon.</p>;

  const total = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const asked = Number.parseInt(String(Array.isArray(query.page) ? query.page[0] : query.page ?? "1"), 10);
  const page = Number.isFinite(asked) ? Math.min(Math.max(asked, 1), total) : 1;
  const from = (page - 1) * PER_PAGE;
  const shown = rest.slice(from, from + PER_PAGE);

  return (
    <div className="space-y-10">
      {page === 1 && <FeaturedPost post={lead} />}
      {rest.length > 0 && (
        <section id="latest" className="scroll-mt-28">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-2xl font-bold">Latest news</h2>
            <p className="text-sm text-muted">
              Showing {from + 1}–{from + shown.length} of {rest.length} stories
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          <Pagination page={page} total={total} hrefFor={(n) => (n === 1 ? "/news#latest" : `/news?page=${n}#latest`)} />
        </section>
      )}
    </div>
  );
}

// Grey shapes in the same layout as page 1: the large story, the "Latest news" heading, 6 cards and the page buttons.
function NewsSkeleton() {
  return (
    <div className="space-y-10">
      <FeaturedPostSkeleton />
      <section>
        <div aria-hidden className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-40" />
        </div>
        <CardsSkeleton kind="post" count={6} label="Loading news" />
        <div aria-hidden className="mt-8 flex justify-center gap-2">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
        </div>
      </section>
    </div>
  );
}

export default function News({ searchParams }: PageProps<"/news">) {
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
      <Suspense fallback={<NewsSkeleton />}>
        <NewsList searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}
