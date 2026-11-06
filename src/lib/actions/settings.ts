"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, fieldErrors, flag, ok, str } from "@/lib/actions/helpers";
import { normalisePhone, prettyPhone } from "@/lib/prayer";
import { TAGS } from "@/lib/tags";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  email: z.string().trim().min(1, "Please enter an email address.").pipe(z.email("Please enter a real email address.")),
  facebook: z.string().trim().refine((v) => v === "" || /^https:\/\/(www\.)?facebook\.com\/.+/.test(v), "Please paste the full Facebook link, starting with https://facebook.com/"),
  banner_text: z.string().trim().max(200, "The message is too long (200 letters at most)."),
});

export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse({ email: str(fd, "email"), facebook: str(fd, "facebook"), banner_text: str(fd, "banner_text") });
  const errors: Record<string, string> = parsed.success ? {} : fieldErrors(parsed.error);

  // Phone numbers: one per line. A stray 0 after +61 is removed automatically.
  const phones: string[] = [];
  let fixedZero = false;
  for (const line of str(fd, "phones").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const n = normalisePhone(line);
    if (!n.ok) {
      errors.phones = `"${line.trim()}" does not look like an Australian phone number. Example: +61 3 5555 0101 or +61 412 345 678`;
      break;
    }
    fixedZero ||= n.fixedZero;
    phones.push(prettyPhone(n.value));
  }
  if (!errors.phones && phones.length === 0) errors.phones = "Please add at least one phone number.";
  if (Object.keys(errors).length || !parsed.success) return fail("Please check the form.", errors);

  const bannerOn = flag(fd, "banner_on");
  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    phones,
    email: parsed.data.email,
    facebook: parsed.data.facebook,
    banner_on: bannerOn && parsed.data.banner_text !== "",
    banner_text: parsed.data.banner_text,
    updated_at: new Date().toISOString(),
  });
  if (error) return fail(dbError(error));
  updateTag(TAGS.settings);
  return ok(fixedZero ? "Saved. An extra 0 after +61 was removed." : "Saved");
}
