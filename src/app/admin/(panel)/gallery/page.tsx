import type { Metadata } from "next";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import { melbourneToday } from "@/lib/prayer";
import type { GalleryRow } from "@/lib/types";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id,caption,album,photo_url,thumb_url,width,height,taken_on,featured,visible,created_at")
    .order("created_at", { ascending: false });
  if (error) return <LoadError error={error} />;
  return <GalleryManager photos={(data ?? []) as GalleryRow[]} today={melbourneToday()} />;
}
