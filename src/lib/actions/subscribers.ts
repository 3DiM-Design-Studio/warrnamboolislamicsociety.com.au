"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, ok } from "@/lib/actions/helpers";
import type { ActionState } from "@/lib/types";

export async function setSubscriberStatus(id: string, subscribed: boolean): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("subscribers").update({ status: subscribed ? "subscribed" : "unsubscribed" }).eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(subscribed ? "Subscribed again" : "Unsubscribed");
}

export async function deleteSubscriber(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("subscribers").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok("Removed from the list");
}
