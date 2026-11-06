"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, fieldErrors, ok, str } from "@/lib/actions/helpers";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Please enter an email address.").pipe(z.email("Please enter a real email address.")),
});

// Adding an email here lets that person use the admin once their login exists in Supabase
// (Authentication > Users > Add user). Only people on this list can write anything.
export async function addAdmin(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse({ email: str(fd, "email") });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));
  const { error } = await supabase.from("admins").insert({ email: parsed.data.email });
  if (error) return fail(error.code === "23505" ? "This person is already on the list." : dbError(error));
  return ok("Added to the admin list");
}

export async function removeAdmin(email: string): Promise<ActionState> {
  const { supabase, email: me } = await requireAdmin();
  if (email.toLowerCase() === me) return fail("You cannot remove yourself.");
  const { error } = await supabase.from("admins").delete().eq("email", email.toLowerCase());
  if (error) return fail(dbError(error));
  return ok("Removed from the admin list");
}
