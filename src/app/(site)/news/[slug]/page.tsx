import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { ShareButtons } from "@/components/share-buttons";
import { PostCard } from "@/components/story-cards";
import { site } from "@/content/site";
import { getPost, getPosts } from "@/lib/content";
import { cleanHtml, htmlToText } from "@/lib/sanitize";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Story not found" };
  const description = post.excerpt || undefined;
  return {
    title: post.title,
    description,
    openGraph: { type: "article" as const, title: post.title, description, publishedTime: post.post_date, images: [post.photo_url || "/opengraph-image"] },
  };
}

export default function PostPage({ params }: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<PageShell title="Loading" crumb="Article">{null}</PageShell>}>
      <Post params={params} />
    </Suspense>
  );
}

const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T12:00:00Z`));

async function Post({ params }: { params: PageProps<"/news/[slug]">["params"] }) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();

  // Neighbours in the order the News page uses: newer stories come before this one, older ones after it.
  const at = all.findIndex((p) => p.slug === post.slug);
  const newer = at > 0 ? all[at - 1] : null;
  const older = at >= 0 && at < all.length - 1 ? all[at + 1] : null;
  const more = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  const words = htmlToText(post.body).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  const neighbour = "group flex min-w-0 flex-1 flex-col gap-1 rounded-2xl bg-card p-5 transition-colors hover:bg-white";

  return (
    <PageShell
      title={post.title}
      crumb="Article"
      parent={{ label: "News", href: "/news" }}
      intro={`${longDate(post.post_date)} · ${minutes} min read`}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: post.title,
          datePublished: post.post_date,
          ...(post.photo_url ? { image: [post.photo_url] } : {}),
          author: { "@type": "Organization", name: site.name },
          publisher: { "@type": "Organization", name: site.name },
        }}
      />
      <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold link-fx">
        <ArrowLeft className="size-4" aria-hidden />
        Back to News
      </Link>
      {post.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.photo_url} alt="" className="w-full rounded-2xl" />
      )}
      <div
        className="max-w-3xl space-y-4 text-lg [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: cleanHtml(post.body) }}
      />

      <div className="max-w-3xl border-t border-border pt-6">
        <p className="mb-2 text-sm font-semibold">Share this story</p>
        <ShareButtons title={post.title} />
      </div>

      {(newer || older) && (
        <nav aria-label="Other stories" className="flex max-w-3xl flex-col gap-3 pt-4 sm:flex-row">
          {newer ? (
            <Link href={`/news/${newer.slug}`} className={neighbour}>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <ArrowLeft className="size-4" aria-hidden /> Newer story
              </span>
              <span className="line-clamp-2 font-bold">{newer.title}</span>
            </Link>
          ) : (
            <span className="hidden flex-1 sm:block" />
          )}
          {older ? (
            <Link href={`/news/${older.slug}`} className={`${neighbour} sm:text-right`}>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted sm:justify-end">
                Older story <ArrowRight className="size-4" aria-hidden />
              </span>
              <span className="line-clamp-2 font-bold">{older.title}</span>
            </Link>
          ) : (
            <span className="hidden flex-1 sm:block" />
          )}
        </nav>
      )}

      {more.length > 0 && (
        <section className="pt-10" aria-labelledby="more-news">
          <div className="mb-5">
            <SectionHeading id="more-news" title="More from the community" href="/news" label="All news" />
          </div>
          <div className="reveal-cards grid gap-4 sm:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
