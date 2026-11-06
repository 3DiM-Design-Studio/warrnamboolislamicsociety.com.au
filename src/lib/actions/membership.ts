"use server";

import { z } from "zod";
import { sendMail } from "@/lib/mail";
import { createAnonClient, hasSupabase } from "@/lib/supabase/anon";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120, "That name is too long."),
  email: z.string().trim().min(1, "Please enter your email.").max(200).pipe(z.email("Please enter a real email address.")),
  phone: z.string().trim().max(40, "That phone number is too long.").optional().default(""),
});

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Public membership request. It is saved as "new" so the committee can review it in the admin. */
export async function joinMembership(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Hidden field that real people never fill in. Bots do.
  if (String(formData.get("website") ?? "") !== "") {
    return { ok: true, message: "Thank you. Your request has been sent.", at: Date.now() };
  }

  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Please check the form.", errors, at: Date.now() };
  }
  if (!hasSupabase) return { ok: false, message: "Membership is not available right now. Please contact the committee.", at: Date.now() };

  const { name, email, phone } = parsed.data;
  const { error } = await createAnonClient().from("members").insert({ name, email, phone, status: "new" });
  if (error) return { ok: false, message: "Sorry, something went wrong. Please try again or contact the committee.", at: Date.now() };

  // Tell the committee by email when mail is set up. The request is already saved, so a mail problem is not shown to the visitor.
  if (process.env.SMTP_HOST && process.env.MAIL_FROM) {
    try {
      await sendMail({
        to: process.env.MAIL_FROM,
        subject: `New membership request from ${name}`,
        html: `<p>${esc(name)} &lt;${esc(email)}&gt;${phone ? `, ${esc(phone)}` : ""}</p><p>Review it in the admin under Members.</p>`,
      });
    } catch {
      /* ignore */
    }
  }
  return { ok: true, message: "Thank you. Your request has been sent and the committee will be in touch.", at: Date.now() };
}
