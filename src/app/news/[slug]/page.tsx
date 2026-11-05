import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { posts } from "@/content/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  return { title: posts.find((p) => p.slug === slug)?.title };
}

export default async function Post({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <PageShell title={post.title} intro={post.date}>
      {post.body.map((para) => (
        <p key={para}>{para}</p>
      ))}
    </PageShell>
  );
}
