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
  address: z.string().trim().max(200, "That address is too long."),
  suburb: z.string().trim().max(80, "That suburb is too long."),
  postcode: z.string().trim().refine((v) => v === "" || /^\d{4}$/.test(v), "A postcode is 4 numbers."),
  spouse: z.string().trim().max(120, "That name is too long."),
  children: z.string().trim().max(600, "That is too long."),
});

// Adds a member, or changes one when the form carries an id.
export async function saveMember(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const parsed = schema.safeParse({
    first_name: str(fd, "first_name"),
    last_name: str(fd, "last_name"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    address: str(fd, "address"),
    suburb: str(fd, "suburb"),
    postcode: str(fd, "postcode"),
    spouse: str(fd, "spouse"),
    children: str(fd, "children"),
  });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));
  // Children are typed in one box; store them the same way the website form does ("A; B; C").
  const children = parsed.data.children.split(/[;,]/).map((c) => c.trim()).filter(Boolean).join("; ");
  if (id) {
    // Only the details change: when they joined, what they paid and the payment link stay as they were.
    const { error } = await supabase.from("members").update({ ...parsed.data, children }).eq("id", id);
    if (error) return fail(dbError(error));
    return ok("Member saved");
  }
  const { error } = await supabase.from("members").insert({
    ...parsed.data,
    children,
    submitted_date: new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne" }).format(new Date()),
    status: "member",
  });
  if (error) return fail(dbError(error));
  return ok("Member added");
}

export async function deleteMember(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) return fail(dbError(error));
  return ok("Member deleted");
}
