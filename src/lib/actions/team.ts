"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, fieldErrors, ok, str } from "@/lib/actions/helpers";
import { supabaseUrl } from "@/lib/supabase/anon";
import { TAGS } from "@/lib/tags";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(1, "Please add a name.").max(120, "That name is too long."),
  role: z.string().trim().min(1, "Please add a role.").max(120, "That role is too long."),
});
const PHOTO_PREFIX = `${supabaseUrl}/storage/v1/object/public/photos/`;

export async function saveTeamMember(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const parsed = schema.safeParse({ name: str(fd, "name"), role: str(fd, "role") });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));
  const photo = str(fd, "photo_url");
  if (photo && !photo.startsWith(PHOTO_PREFIX)) return fail("That photo could not be used. Please upload it again.");
  const row = { ...parsed.data, photo_url: photo || null };

  if (id) {
    const { error } = await supabase.from("team_members").update(row).eq("id", id);
    if (error) return fail(dbError(error));
  } else {
    const { data: last } = await supabase.from("team_members").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { error } = await supabase.from("team_members").insert({ ...row, sort_order: (last?.sort_order ?? 0) + 10 });
    if (error) return fail(dbError(error));
  }
  updateTag(TAGS.team);
  return ok("Saved");
}

export async function deleteTeamMember(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) return fail(dbError(error));
  updateTag(TAGS.team);
  return ok("Removed");
}

/** Swaps the order of two neighbours. direction: -1 moves up, 1 moves down. */
export async function moveTeamMember(id: string, direction: -1 | 1): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("team_members").select("id,sort_order").order("sort_order", { ascending: true });
  if (error || !data) return fail(dbError(error ?? { message: "" }));
  const i = data.findIndex((r) => r.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= data.length) return fail("It cannot move any further.");
  // Renumber the whole list so ties can never leave the order unclear.
  const order = data.map((r) => r.id);
  [order[i], order[j]] = [order[j], order[i]];
  for (let n = 0; n < order.length; n++) {
    const { error: e } = await supabase.from("team_members").update({ sort_order: (n + 1) * 10 }).eq("id", order[n]);
    if (e) return fail(dbError(e));
  }
  updateTag(TAGS.team);
  return ok("Order saved");
}
