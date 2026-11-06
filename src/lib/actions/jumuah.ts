"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { TIME, dbError, fail, fieldErrors, ok, str } from "@/lib/actions/helpers";
import { MAX_DAYS } from "@/lib/prayer";
import { TAGS } from "@/lib/tags";
import type { ActionState } from "@/lib/types";

const schema = z
  .object({
    name: z.string().trim().min(1, "Please add a name.").max(80, "That name is too long."),
    start_month: z.coerce.number().int().min(1).max(12),
    start_day: z.coerce.number().int().min(1, "Choose a day from 1 to 31.").max(31, "Choose a day from 1 to 31."),
    end_month: z.coerce.number().int().min(1).max(12),
    end_day: z.coerce.number().int().min(1, "Choose a day from 1 to 31.").max(31, "Choose a day from 1 to 31."),
    jumuah_time: z.string().regex(TIME, "Please choose a time."),
  })
  .refine((v) => v.start_day <= MAX_DAYS[v.start_month - 1], { path: ["start_day"], message: "That day does not exist in that month." })
  .refine((v) => v.end_day <= MAX_DAYS[v.end_month - 1], { path: ["end_day"], message: "That day does not exist in that month." });

export async function saveSeason(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const parsed = schema.safeParse({
    name: str(fd, "name"),
    start_month: str(fd, "start_month"),
    start_day: str(fd, "start_day"),
    end_month: str(fd, "end_month"),
    end_day: str(fd, "end_day"),
    jumuah_time: str(fd, "jumuah_time"),
  });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));
  const { error } = id ? await supabase.from("jumuah_seasons").update(parsed.data).eq("id", id) : await supabase.from("jumuah_seasons").insert(parsed.data);
  if (error) return fail(dbError(error));
  updateTag(TAGS.jumuah);
  return ok("Season saved");
}

export async function deleteSeason(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("jumuah_seasons").delete().eq("id", id);
  if (error) return fail(dbError(error));
  updateTag(TAGS.jumuah);
  return ok("Season deleted");
}
