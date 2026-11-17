"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { SECTIONS, type AlertSection } from "@/lib/alerts";
import type { ActionState } from "@/lib/types";

// Called when an admin opens a page that has an alert. Quiet on purpose: no message on screen.
// Refreshing makes the menu number and the dashboard bar disappear straight away.
export async function markSeen(section: AlertSection): Promise<ActionState> {
  const { supabase, email } = await requireAdmin();
  if (!(section in SECTIONS)) return null;
  const { error } = await supabase.from("admin_seen").upsert({ email, section, seen_at: new Date().toISOString() }, { onConflict: "email,section" });
  if (!error) refresh();
  return null;
}
