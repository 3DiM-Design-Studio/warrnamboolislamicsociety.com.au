"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, ok } from "@/lib/actions/helpers";
import type { ActionState } from "@/lib/types";

export async function deleteDonation(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("donations").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok("Donation deleted");
}
