import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getPost } from "@/lib/content";
import { cleanHtml } from "@/lib/sanitize";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post?.title };
}

export default function PostPage({ params }: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<PageShell title="Loading">{null}</PageShell>}>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: { params: PageProps<"/news/[slug]">["params"] }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <PageShell title={post.title} intro={post.post_date}>
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
