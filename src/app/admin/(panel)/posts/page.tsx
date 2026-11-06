import type { Metadata } from "next";
import { PostsManager } from "@/components/admin/posts-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import { melbourneToday } from "@/lib/prayer";
import type { PostRow } from "@/lib/types";

export const metadata: Metadata = { title: "News posts" };

export default async function PostsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,body,photo_url,post_date,status,pinned")
    .order("pinned", { ascending: false })
    .order("post_date", { ascending: false });
  if (error) return <LoadError error={error} />;
  return <PostsManager posts={(data ?? []) as PostRow[]} today={melbourneToday()} />;
}
