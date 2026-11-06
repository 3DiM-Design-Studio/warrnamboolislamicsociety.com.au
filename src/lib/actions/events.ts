"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { DATE, TIME, dbError, fail, fieldErrors, flag, ok, str } from "@/lib/actions/helpers";
import { TAGS } from "@/lib/tags";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  title: z.string().trim().min(1, "Please add a name.").max(200, "The name is too long."),
  event_date: z.string().regex(DATE, "Please choose a date."),
  event_time: z.string().regex(TIME, "Please choose a time."),
  place: z.string().trim().max(200, "That is too long."),
});

export async function saveEvent(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const parsed = schema.safeParse({
    title: str(fd, "title"),
    event_date: str(fd, "event_date"),
    event_time: str(fd, "event_time"),
    place: str(fd, "place"),
  });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));

  const row = { ...parsed.data, place: parsed.data.place || "To be announced", status: flag(fd, "published") ? "published" : "draft" };
  const { error } = id ? await supabase.from("events").update(row).eq("id", id) : await supabase.from("events").insert(row);
  if (error) return fail(dbError(error));
  updateTag(TAGS.events);
  return ok("Event saved");
}

export async function deleteEvent(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return fail(dbError(error));
  updateTag(TAGS.events);
  return ok("Event deleted");
}
