"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { sendAccessEmail } from "@/lib/auth-email";
import { mailConfigured } from "@/lib/mail";
import { SITE_URL } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, str } from "@/lib/actions/helpers";
import { SEEN_COOKIE, seenCookieOptions } from "@/lib/session-rules";
import type { ActionState } from "@/lib/types";

const markSeen = async () => (await cookies()).set(SEEN_COOKIE, String(Date.now()), seenCookieOptions);
const clearSeen = async () => (await cookies()).delete(SEEN_COOKIE);

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return fail("Please enter your email and password.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Only a real wrong-login says "not right". Anything else (bad key, unconfirmed email, network) is shown as it is.
    if (error.code === "invalid_credentials") return fail("That email or password is not right.");
    if (error.code === "email_not_confirmed") return fail("Please open the email we sent you and press its link first.");
    return fail(`Sign-in problem: ${error.message}`);
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return fail("This email is not on the admin list. Please ask an admin to add you.");
  }
  await markSeen();
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearSeen();
  redirect("/admin/login?notice=signed-out");
}

/** Called by the page itself when nobody has touched it for the whole idle time. */
export async function signOutIdle() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearSeen();
  redirect("/admin/login?error=idle");
}

const EMAIL = /^[^s@]+@[^s@]+.[^s@]+$/;
const SENT = "If this email is on the admin list, a link is on its way. Please check your inbox, and your spam folder too.";

// One link every minute per email is plenty. This only slows down someone who keeps pressing the button.
const lastAsked = new Map<string, number>();

/**
 * Emails a one-time link where an admin chooses a password. It is the same job for "First time here" and
 * "Forgot password": make the login if it does not exist yet, then send the link from the society's own email.
 * The answer is always the same, so nobody can use it to find out who is an admin.
 */
async function sendAccessLink(fd: FormData, kind: "first" | "reset"): Promise<ActionState> {
  const email = str(fd, "email").trim().toLowerCase();
  if (!EMAIL.test(email)) return fail("Please enter your email address.");
  if (!mailConfigured()) return fail("Email is not set up yet. Please ask the person who looks after the website.");
  const admin = createAdminClient();
  if (!admin) return fail("Sign-in emails are not switched on yet. Please ask the person who looks after the website.");

  const { data: listed, error: listError } = await admin.from("admins").select("email").eq("email", email).maybeSingle();
  if (listError) {
    console.error("Admin list check failed", listError);
    return fail(`Something went wrong while checking the admin list: ${listError.message}`);
  }
  if (!listed) return ok(SENT); // not an admin: say nothing, send nothing

  const now = Date.now();
  if (now - (lastAsked.get(email) ?? 0) < 60_000) return ok(SENT);
  lastAsked.set(email, now);

  try {
    let link = await admin.auth.admin.generateLink({ type: "recovery", email });
    if (link.error) {
      // No login yet: make one with a random password nobody knows, then ask again.
      const made = await admin.auth.admin.createUser({ email, email_confirm: true, password: randomBytes(24).toString("base64url") });
      if (made.error) throw made.error;
      link = await admin.auth.admin.generateLink({ type: "recovery", email });
    }
    const token = link.data?.properties?.hashed_token;
    if (link.error || !token) throw link.error ?? new Error("No link was made");
    await sendAccessEmail({ to: email, kind, link: `${SITE_URL}/admin/auth/confirm?token_hash=${encodeURIComponent(token)}&type=recovery&next=/admin/set-password` });
    return ok(SENT);
  } catch (e) {
    console.error("Sign-in link failed", e);
    lastAsked.delete(email);
    return fail("The email could not be sent. Please try again in a few minutes.");
  }
}

/** "Forgot password". */
export async function requestResetLink(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return sendAccessLink(fd, "reset");
}

/** "First time here". */
export async function requestFirstTimeLink(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return sendAccessLink(fd, "first");
}

/** Saves a new password for whoever is signed in (first time, forgot password, or changing it later). */
export async function setPassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const password = str(fd, "password");
  const again = str(fd, "again");
  if (password.length < 8) return fail("Please check the password.", { password: "Please use at least 8 letters or numbers." });
  if (password !== again) return fail("Please check the password.", { again: "The two passwords are not the same." });

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return fail("Please check the password.", { password: "Please choose a password you have not used before." });
    if (error.code === "weak_password") return fail("Please check the password.", { password: "That password is too easy to guess. Try a longer one." });
    return fail(`The password could not be saved: ${error.message}`);
  }
  await markSeen();
  redirect("/admin");
}
