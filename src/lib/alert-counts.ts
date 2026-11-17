import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NO_ALERTS, SECTIONS, type AlertCounts, type AlertSection } from "@/lib/alerts";

/**
 * How many new things each section has for this admin: whatever was created after they last opened that page.
 * A section with no "last seen" time yet counts as zero, so a brand-new admin is not greeted by old history.
 * If something is not set up yet (a missing table or column), that section simply shows no alert.
 */
export async function getAlertCounts(supabase: SupabaseClient, email: string): Promise<AlertCounts> {
  const { data: seen } = await supabase.from("admin_seen").select("section,seen_at").eq("email", email);
  const lastSeen = new Map<string, string>((seen ?? []).map((r) => [r.section as string, r.seen_at as string]));

  const entries = await Promise.all(
    (Object.keys(SECTIONS) as AlertSection[]).map(async (section) => {
      const since = lastSeen.get(section);
      if (!since) return [section, 0] as const;
      const { count } = await supabase.from(SECTIONS[section].table).select("id", { count: "exact", head: true }).gt("created_at", since);
      return [section, count ?? 0] as const;
    }),
  );
  return { ...NO_ALERTS, ...Object.fromEntries(entries) };
}
