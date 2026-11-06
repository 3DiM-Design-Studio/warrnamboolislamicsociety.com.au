import type { Metadata } from "next";
import { LoadError } from "@/components/admin/setup-notice";
import { TeamManager } from "@/components/admin/team-manager";
import { requireAdmin } from "@/lib/auth";
import type { TeamRow } from "@/lib/types";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("team_members").select("id,name,role,photo_url,sort_order").order("sort_order", { ascending: true });
  if (error) return <LoadError error={error} />;
  return <TeamManager team={(data ?? []) as TeamRow[]} />;
}
