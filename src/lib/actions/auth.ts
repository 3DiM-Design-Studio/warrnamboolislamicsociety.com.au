"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { issueAccessLink } from "@/lib/access-link";
import { mailConfigured } from "@/lib/mail";
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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENT = "If this email is on the admin list, a link is on its way. Please check your inbox, and your spam folder too.";
const JOINED = "Thank you. If an admin has already added you, a link to choose your password is on its way (check spam too). If not, your request is waiting for an admin to approve it, and you will get an email when it is approved.";
const MAX_WAITING = 25;

// One email a minute per address is plenty. This only slows down someone who keeps pressing the button.
const lastAsked = new Map<string, number>();
const tooSoon = (key: string) => {
  const now = Date.now();
  if (now - (lastAsked.get(key) ?? 0) < 60_000) return true;
  lastAsked.set(key, now);
  return false;
};

/**
 * "First time here" and "Forgot password": checks the email is on the admin list, then emails a one-time link
 * from the society's own email. The answer is always the same, so nobody can use it to find out who is an admin.
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
  if (tooSoon(`link:${email}`)) return ok(SENT);

  const result = await issueAccessLink(email, kind);
  if (result === "failed") {
    lastAsked.delete(`link:${email}`);
    return fail("The email could not be sent. Please try again in a few minutes.");
  }
  return ok(SENT);
}

/** "Forgot password". */
export async function requestResetLink(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return sendAccessLink(fd, "reset");
}

/**
 * "First time here?": one page for everyone new.
 * - Already on the admin list (an admin added them): they are emailed a link to choose a password.
 * - Not on the list: their name and email are saved as a waiting request. No email is sent; admins see an alert
 *   on the dashboard and a number beside "Admin users". Nothing is allowed until an admin approves it.
 * The answer is the same either way, so nobody can use this page to find out who is an admin.
 */
export async function requestAdminAccess(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, "website")) return ok(JOINED); // a hidden box only a robot fills in
  const name = str(fd, "name").trim().replace(/s+/g, " ");
  const email = str(fd, "email").trim().toLowerCase();
  if (name.length < 2 || name.length > 80) return fail("Please check the form.", { name: "Please enter your name." });
  if (!EMAIL.test(email) || email.length > 200) return fail("Please check the form.", { email: "Please enter a real email address." });
  const admin = createAdminClient();
  if (!admin) return fail("Requests are not switched on yet. Please ask an admin to add you.");
  if (tooSoon(`request:${email}`)) return ok(JOINED);

  const { data: already } = await admin.from("admins").select("email").eq("email", email).maybeSingle();
  if (already) {
    // An admin already added them: send the link to choose a password.
    const result = await issueAccessLink(email, "first");
    if (result === "failed") {
      lastAsked.delete(`request:${email}`);
      return fail("The email could not be sent. Please try again in a few minutes.");
    }
    if (result !== "sent") return fail("Email is not set up yet. Please ask the person who looks after the website.");
    return ok(JOINED);
  }

  const { count } = await admin.from("admin_requests").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= MAX_WAITING) return fail("Too many requests are waiting right now. Please ask an admin to add you directly.");

  const { error } = await admin.from("admin_requests").upsert({ email, name }, { onConflict: "email" });
  if (error) {
    console.error("Admin request failed", error);
    return fail("Your request could not be saved. Please try again later.");
  }

  return ok(JOINED);
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
