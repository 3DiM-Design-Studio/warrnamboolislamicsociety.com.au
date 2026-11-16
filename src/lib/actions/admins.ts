"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { issueAccessLink, type IssueResult } from "@/lib/access-link";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, fieldErrors, ok, str } from "@/lib/actions/helpers";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Please enter an email address.").pipe(z.email("Please enter a real email address.")),
});

// What to tell the admin after we tried to email someone their "choose a password" link.
function linkMessage(prefix: string, email: string, result: IssueResult): ActionState {
  if (result === "sent") return ok(`${prefix} The email with a link to choose a password is on its way to ${email}. No approval needed.`);
  if (result === "failed") return ok(`${prefix} The email could not be sent. Press "Send link" beside their name to try again.`);
  return ok(`${prefix} No email was sent because email is not set up yet. They can press "First time here?" on the sign-in page.`);
}

// Adding an email lets that person use the admin, and emails them a link to choose a password.
// Adding is the approval. Only people on this list can write anything.
export async function addAdmin(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse({ email: str(fd, "email") });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));
  const { email } = parsed.data;
  const { error } = await supabase.from("admins").insert({ email });
  if (error) return fail(error.code === "23505" ? "This person is already on the list." : dbError(error));
  // If they had asked to join, that request is answered now.
  await supabase.from("admin_requests").delete().eq("email", email);
  const result = await issueAccessLink(email, "invited");
  refresh();
  return linkMessage("Added.", email, result);
}

export async function removeAdmin(email: string): Promise<ActionState> {
  const { supabase, email: me } = await requireAdmin();
  if (email.toLowerCase() === me) return fail("You cannot remove yourself.");
  const { error } = await supabase.from("admins").delete().eq("email", email.toLowerCase());
  if (error) return fail(dbError(error));
  refresh();
  return ok("Removed from the admin list");
}

/** Emails someone on the list a fresh link (the first one may have expired after an hour). */
export async function resendAdminLink(email: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const clean = email.trim().toLowerCase();
  const { data } = await supabase.from("admins").select("email").eq("email", clean).maybeSingle();
  if (!data) return fail("That person is not on the admin list.");
  const result = await issueAccessLink(clean, "invited");
  if (result === "sent") return ok(`A new link was sent to ${clean}.`);
  if (result === "failed") return fail("The email could not be sent. Please try again in a few minutes.");
  return fail("No email was sent because email is not set up yet.");
}

/** Approves a waiting request: puts the email on the list and emails the "choose a password" link. */
export async function approveAdminRequest(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data: request } = await supabase.from("admin_requests").select("email,name").eq("id", id).maybeSingle();
  if (!request) return fail("That request is no longer there. Someone may have answered it already.");

  const { error } = await supabase.from("admins").insert({ email: request.email });
  if (error && error.code !== "23505") return fail(dbError(error));
  await supabase.from("admin_requests").delete().eq("id", id);
  const result = await issueAccessLink(request.email, "approved");
  refresh();
  return linkMessage(`${request.name} was approved.`, request.email, result);
}

export async function declineAdminRequest(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("admin_requests").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok("Request denied");
}
