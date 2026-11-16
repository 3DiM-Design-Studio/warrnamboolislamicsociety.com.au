"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { DATE, TIME, dbError, fail, fieldErrors, flag, ok, str } from "@/lib/actions/helpers";
import { announceEvent } from "@/lib/event-email";
import { EVENT_TYPES, HAS_SPEAKER } from "@/lib/event-types";
import { supabaseUrl } from "@/lib/supabase/anon";
import { TAGS } from "@/lib/tags";
import type { ActionState } from "@/lib/types";

const PHOTO_PREFIX = `${supabaseUrl}/storage/v1/object/public/photos/`;
const types = EVENT_TYPES.map((t) => t.value) as [string, ...string[]];

const schema = z
  .object({
    title: z.string().trim().min(1, "Please add a name.").max(200, "The name is too long."),
    event_type: z.enum(types, { error: "Please choose a type." }),
    short_description: z.string().trim().max(300, "Please keep this under 300 letters."),
    description: z.string().trim().max(5000, "That is too long."),
    event_date: z.string().regex(DATE, "Please choose a date."),
    event_time: z.string().regex(TIME, "Please choose a time."),
    end_date: z.string().regex(DATE, "Please choose a date.").or(z.literal("")),
    end_time: z.string().regex(TIME, "Please choose a time.").or(z.literal("")),
    place: z.string().trim().max(200, "That is too long."),
    map_url: z
      .string()
      .trim()
      .max(500, "That link is too long.")
      .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Please paste a full link that starts with https://"),
    speaker: z.string().trim().max(120, "That is too long."),
    audience: z.string().trim().max(120, "That is too long."),
    notes: z.string().trim().max(1000, "That is too long."),
    status: z.enum(["draft", "published", "cancelled"]),
  })
  .superRefine((v, ctx) => {
    if (!v.end_date !== !v.end_time) {
      ctx.addIssue({ code: "custom", path: [v.end_date ? "end_time" : "end_date"], message: "Add both the end date and the end time, or leave both empty." });
    } else if (v.end_date && `${v.end_date}T${v.end_time}` < `${v.event_date}T${v.event_time}`) {
      ctx.addIssue({ code: "custom", path: ["end_date"], message: "The end must be after the start." });
    }
  });

export async function saveEvent(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const parsed = schema.safeParse({
    title: str(fd, "title"),
    event_type: str(fd, "event_type"),
    short_description: str(fd, "short_description"),
    description: str(fd, "description"),
    event_date: str(fd, "event_date"),
    event_time: str(fd, "event_time"),
    end_date: str(fd, "end_date"),
    end_time: str(fd, "end_time"),
    place: str(fd, "place"),
    map_url: str(fd, "map_url"),
    speaker: str(fd, "speaker"),
    audience: str(fd, "audience"),
    notes: str(fd, "notes"),
    status: str(fd, "status"),
  });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));

  const photo = str(fd, "photo_url");
  if (photo && !photo.startsWith(PHOTO_PREFIX)) return fail("That photo could not be used. Please upload it again.");

  const d = parsed.data;
  const row = {
    ...d,
    place: d.place || "To be announced",
    // Only types led by a person keep a speaker, so a changed type does not leave an old name behind.
    speaker: HAS_SPEAKER.includes(d.event_type) ? d.speaker : "",
    end_date: d.end_date || null,
    end_time: d.end_time || null,
    photo_url: photo || null,
    updated_at: new Date().toISOString(),
  };
  let eventId = id;
  if (id) {
    const { error } = await supabase.from("events").update(row).eq("id", id);
    if (error) return fail(dbError(error));
  } else {
    const { data, error } = await supabase.from("events").insert(row).select("id").single();
    if (error || !data) return fail(dbError(error ?? { message: "" }));
    eventId = data.id;
  }
  updateTag(TAGS.events);

  // Optional: email the newsletter subscribers. An email problem never undoes the saved event.
  if (!flag(fd, "notify") || d.status !== "published") return ok("Event saved");
  try {
    const { data: current } = await supabase.from("events").select("announced_at").eq("id", eventId).maybeSingle();
    if (current?.announced_at) return ok("Event saved. Subscribers were already emailed about it earlier.");

    const result = await announceEvent(supabase, { id: eventId, ...row });

    if (result.status === "not-configured") return ok("Event saved, but no email was sent because email is not set up yet.");
    if (result.status === "no-subscribers") return ok("Event saved. There are no newsletter subscribers to email yet.");
    if (result.sent > 0) await supabase.from("events").update({ announced_at: new Date().toISOString() }).eq("id", eventId);
    if (result.sent === 0) return ok("Event saved, but the emails could not be sent. Please check the email settings.");
    return ok(`Event saved. Emailed ${result.sent} subscriber${result.sent === 1 ? "" : "s"}${result.failed ? ` (${result.failed} failed)` : ""}.`);
  } catch (e) {
    console.error("Event email failed", e);
    return ok("Event saved, but the emails could not be sent. Please try again.");
  }
}

export async function deleteEvent(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return fail(dbError(error));
  updateTag(TAGS.events);
  return ok("Event deleted");
}
