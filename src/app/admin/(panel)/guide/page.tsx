import type { Metadata } from "next";
import { GuideBook } from "@/components/admin/guide-book";
import { topicBySlug } from "@/lib/guide-content";

export const metadata: Metadata = { title: "Guide" };

export default async function GuidePage({ searchParams }: { searchParams: Promise<{ topic?: string | string[] }> }) {
  const { topic } = await searchParams;
  return <GuideBook initialTopic={topicBySlug(Array.isArray(topic) ? topic[0] : topic).slug} />;
}
