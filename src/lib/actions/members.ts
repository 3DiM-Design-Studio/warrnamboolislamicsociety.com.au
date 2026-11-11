"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, fieldErrors, ok, str } from "@/lib/actions/helpers";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  first_name: z.string().trim().min(1, "Please add a first name.").max(60, "That name is too long."),
  last_name: z.string().trim().min(1, "Please add a last name.").max(60, "That name is too long."),
  email: z.string().trim().min(1, "Please add an email.").max(200).pipe(z.email("Please enter a real email address.")),
  phone: z.string().trim().max(40, "That phone number is too long."),
});

export async function addMember(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse({
    first_name: str(fd, "first_name"),
    last_name: str(fd, "last_name"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
  });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));
  // Added by hand, so there is nothing to review: they are a member straight away.
  const { error } = await supabase
    .from("members")
    .insert({ ...parsed.data, submitted_date: new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne" }).format(new Date()), status: "member" });
  if (error) return fail(dbError(error));
  return ok("Member added");
}

export async function approveMember(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("members").update({ status: "member" }).eq("id", id);
  if (error) return fail(dbError(error));
  return ok("Member approved");
}

export async function deleteMember(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) return fail(dbError(error));
  return ok("Member deleted");
}
