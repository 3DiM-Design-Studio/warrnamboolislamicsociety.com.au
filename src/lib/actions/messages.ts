"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, ok } from "@/lib/actions/helpers";
import type { ActionState } from "@/lib/types";

// Marks a message as answered, or back to new. Refreshing also updates the count in the menu.
export async function setReplied(id: string, replied: boolean): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contacts").update({ status: replied ? "replied" : "new" }).eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(replied ? "Marked as replied" : "Marked as new");
}

export async function deleteMessage(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok("Message deleted");
}
