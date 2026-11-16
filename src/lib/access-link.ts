import "server-only";
import { randomBytes } from "node:crypto";
import { sendAccessEmail, type AccessKind } from "@/lib/auth-email";
import { mailConfigured } from "@/lib/mail";
import { SITE_URL } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

export type IssueResult = "sent" | "no-mail" | "no-key" | "failed";

/**
 * Makes the login (if it does not exist yet) and emails a one-time link to choose a password.
 * The caller must already have made sure the email is on the admin list.
 */
export async function issueAccessLink(email: string, kind: AccessKind): Promise<IssueResult> {
  if (!mailConfigured()) return "no-mail";
  const admin = createAdminClient();
  if (!admin) return "no-key";
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
    return "sent";
  } catch (e) {
    console.error("Sign-in link failed", e);
    return "failed";
  }
}
