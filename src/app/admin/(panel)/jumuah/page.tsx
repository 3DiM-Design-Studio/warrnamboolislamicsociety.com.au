import type { Metadata } from "next";
import { JumuahManager } from "@/components/admin/jumuah-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import { melbourneToday } from "@/lib/prayer";
import type { JumuahRow } from "@/lib/types";

export const metadata: Metadata = { title: "Jumu’ah" };

export default async function JumuahPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("jumuah_seasons")
    .select("id,name,start_month,start_day,end_month,end_day,jumuah_time")
    .order("start_month", { ascending: true })
    .order("start_day", { ascending: true });
  if (error) return <LoadError error={error} />;
  return <JumuahManager seasons={(data ?? []) as JumuahRow[]} today={melbourneToday()} />;
}
