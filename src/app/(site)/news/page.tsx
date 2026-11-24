import { Bell, BookOpen, Search, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { Pagination } from "@/components/pagination";
import { CardsSkeleton, FeaturedPostSkeleton, Skeleton } from "@/components/skeletons";
import { FeaturedPost, PostCard } from "@/components/story-cards";
import { getPosts, getSettings } from "@/lib/content";
import { htmlToText } from "@/lib/sanitize";

export const metadata = {
  title: "News",
  description: "Announcements, stories and updates from Warrnambool Islamic Society.",
};

const PER_PAGE = 6;

/** True when every word typed appears in the story's title, summary or text. Capital letters do not matter. */
function matches(query: string, text: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = text.toLowerCase();
  return words.every((w) => hay.includes(w));
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// Reads ?q= (search) and ?page= from the address. The first page of the full list also shows the newest story large at the top.
async function NewsList({ searchParams }: { searchParams: PageProps<"/news">["searchParams"] }) {
  const [posts, params, settings] = await Promise.all([getPosts(), searchParams, getSettings()]);
  const q = one(params.q).trim().slice(0, 80);
  const searching = q !== "";
  const found = searching ? posts.filter((p) => matches(q, `${p.title} ${p.excerpt} ${htmlToText(p.body)}`)) : posts;

  const [lead, ...rest] = found;
  // Searching shows every match in a grid. Without a search, the newest story is large and the rest are paged.
  const grid = searching ? found : rest;
  const total = Math.max(1, Math.ceil(grid.length / PER_PAGE));
  const asked = Number.parseInt(one(params.page) || "1", 10);
  const page = Number.isFinite(asked) ? Math.min(Math.max(asked, 1), total) : 1;
  const from = (page - 1) * PER_PAGE;
  const shown = grid.slice(from, from + PER_PAGE);
  const hrefFor = (n: number) => {
    const sp = new URLSearchParams();
    if (searching) sp.set("q", q);
    if (n > 1) sp.set("page", String(n));
    const qs = sp.toString();
    return `/news${qs ? `?${qs}` : ""}#latest`;
  };

  return (
    <div className="space-y-10">
      <form action="/news" method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="news-search" className="sr-only">
          Search news
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="news-search"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={80}
            placeholder="Search news by title or words in the story"
            className="w-full rounded-full border-2 border-border bg-white py-3 pl-12 pr-4 outline-none focus:border-brand-dark"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1 sm:flex-none">
            Search
          </button>
          {searching && (
            <Link href="/news" className="btn-secondary flex-1 sm:flex-none">
              Clear search
            </Link>
          )}
        </div>
      </form>
      {settings.whatsapp && (
        <p className="-mt-6 text-sm text-muted">
          Want news as it happens?{" "}
          <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" className="link-fx font-semibold text-brand-dark">
            Join our WhatsApp group
          </a>
          .
        </p>
      )}

      {posts.length === 0 ? (
        <p className="text-muted">No news yet. Please check back soon.</p>
      ) : searching && found.length === 0 ? (
        <div className="rounded-2xl bg-card p-6">
          <p className="font-semibold">No stories match “{q}”.</p>
          <p className="mt-1 text-muted">Try fewer or different words, or clear the search to see every story.</p>
        </div>
      ) : (
        <>
          {!searching && lead && <FeaturedPost post={lead} />}
          {grid.length > 0 && (
            <section id="latest" className="scroll-mt-28">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-2xl font-bold">{searching ? `Results for “${q}”` : "Latest news"}</h2>
                <p className="text-sm text-muted" aria-live="polite">
                  Showing {from + 1}–{from + shown.length} of {grid.length} {grid.length === 1 ? "story" : "stories"}
                </p>
              </div>
              <div className="reveal-cards grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
              <Pagination page={page} total={total} hrefFor={hrefFor} />
            </section>
          )}
        </>
      )}
    </div>
  );
}

// Grey shapes in the same layout as page 1: search box, the large story, the "Latest news" heading, 6 cards and the page buttons.
function NewsSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-[3.25rem] w-full rounded-full" />
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
