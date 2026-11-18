import { Suspense } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";
import { site } from "@/content/site";
import { getPost } from "@/lib/content";
import { cleanHtml } from "@/lib/sanitize";

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

async function Post({ params }: { params: PageProps<"/news/[slug]">["params"] }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <PageShell
      title={post.title}
      crumb="Article"
      parent={{ label: "News", href: "/news" }}
      intro={post.post_date}
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
      {post.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.photo_url} alt="" className="w-full rounded-2xl" />
      )}
      <div
        className="space-y-4 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: cleanHtml(post.body) }}
      />
    </PageShell>
  );
}
