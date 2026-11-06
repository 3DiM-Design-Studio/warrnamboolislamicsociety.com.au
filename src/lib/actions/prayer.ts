"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { DATE, TIME, dbError, fail, fieldErrors, flag, ok, str } from "@/lib/actions/helpers";
import { METHODS, PRAYERS, type IqamahRules } from "@/lib/prayer";
import { TAGS } from "@/lib/tags";
import type { ActionState } from "@/lib/types";

const ruleSchema = z.object({
  mode: z.enum(["offset", "fixed"]),
  offset: z.coerce.number().int().min(0, "Use 0 or more minutes.").max(90, "Use 90 minutes or less."),
  time: z.string().regex(TIME, "Please choose a time."),
});

export async function savePrayerSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const method = str(fd, "method");
  const asr = str(fd, "asr");
  if (!(method in METHODS)) return fail("Please choose an Azan method.");
  if (asr !== "standard" && asr !== "hanafi") return fail("Please choose an Asr rule.");

  const rules = {} as IqamahRules;
  const errors: Record<string, string> = {};
  for (const [key, label] of PRAYERS) {
    const r = ruleSchema.safeParse({ mode: str(fd, `${key}_mode`), offset: str(fd, `${key}_offset`) || "0", time: str(fd, `${key}_time`) || "00:00" });
    if (!r.success) {
      errors[key] = `${label}: ${r.error.issues[0].message}`;
      continue;
    }
    rules[key] = r.data;
  }
  if (Object.keys(errors).length) return fail("Please check the Iqamah times.", errors);

  const { error } = await supabase.from("prayer_settings").upsert({
    id: 1,
    method,
    asr,
    rules,
    show_on_site: flag(fd, "show_on_site"),
    updated_at: new Date().toISOString(),
  });
  if (error) return fail(dbError(error));
  updateTag(TAGS.prayer);
  return ok("Prayer times saved");
}

const ramadanSchema = z
  .object({
    name: z.string().trim().min(1, "Please add a name.").max(80),
    start_date: z.string().regex(DATE, "Please choose the first day."),
    end_date: z.string().regex(DATE, "Please choose the last day."),
    isha_iqamah: z.string().regex(TIME, "Please choose a time."),
    taraweeh: z.string().regex(TIME, "Please choose a time."),
  })
  .refine((v) => v.end_date >= v.start_date, { path: ["end_date"], message: "The last day must come after the first day." });

export async function saveRamadan(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const parsed = ramadanSchema.safeParse({
    name: str(fd, "name"),
    start_date: str(fd, "start_date"),
    end_date: str(fd, "end_date"),
    isha_iqamah: str(fd, "isha_iqamah"),
    taraweeh: str(fd, "taraweeh"),
  });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));

  const { data: others } = await supabase.from("ramadan_periods").select("id,start_date,end_date");
  const clash = (others ?? []).some((o) => o.id !== id && parsed.data.start_date <= o.end_date && parsed.data.end_date >= o.start_date);
  if (clash) return fail("These dates overlap with other Ramadan dates.", { start_date: "These dates overlap with other Ramadan dates." });

  const { error } = id ? await supabase.from("ramadan_periods").update(parsed.data).eq("id", id) : await supabase.from("ramadan_periods").insert(parsed.data);
  if (error) return fail(dbError(error));
  updateTag(TAGS.prayer);
  return ok("Ramadan dates saved");
}

export async function deleteRamadan(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("ramadan_periods").delete().eq("id", id);
  if (error) return fail(dbError(error));
  updateTag(TAGS.prayer);
  return ok("Deleted");
}
