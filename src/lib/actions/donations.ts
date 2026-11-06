"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, fieldErrors, ok, str } from "@/lib/actions/helpers";
import { TAGS } from "@/lib/tags";
import type { ActionState, Purpose } from "@/lib/types";

const schema = z.object({
  intro: z.string().trim().max(1500, "That message is too long."),
  account_name: z.string().trim().max(120),
  bsb: z.string().trim().max(10),
  account_no: z.string().trim().max(20),
});

export async function saveDonations(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse({ intro: str(fd, "intro"), account_name: str(fd, "account_name"), bsb: str(fd, "bsb"), account_no: str(fd, "account_no") });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));

  const errors: Record<string, string> = {};
  const bsb = parsed.data.bsb.replace(/\D/g, "");
  const acc = parsed.data.account_no.replace(/\D/g, "");
  const anyBank = parsed.data.account_name || bsb || acc;
  if (anyBank) {
    if (!parsed.data.account_name) errors.account_name = "Please add the account name.";
    if (bsb.length !== 6) errors.bsb = "A BSB has 6 numbers.";
    if (acc.length < 6 || acc.length > 10) errors.account_no = "An account number has 6 to 10 numbers.";
  }

  let purposes: Purpose[] = [];
  try {
    const raw = JSON.parse(str(fd, "purposes") || "[]");
    purposes = z
      .array(z.object({ id: z.string().min(1).max(40), name: z.string().trim().min(1).max(80), on: z.boolean() }))
      .max(30)
      .parse(raw);
  } catch {
    errors.purposes = "Please check the list of donation choices.";
  }
  if (Object.keys(errors).length) return fail("Please check the form.", errors);

  const { error } = await supabase.from("donation_settings").upsert({
    id: 1,
    intro: parsed.data.intro,
    account_name: parsed.data.account_name,
    bsb: anyBank ? `${bsb.slice(0, 3)}-${bsb.slice(3)}` : "",
    account_no: anyBank ? acc : "",
    purposes,
    updated_at: new Date().toISOString(),
  });
  if (error) return fail(dbError(error));
  updateTag(TAGS.donations);
  return ok("Donations page saved");
}
