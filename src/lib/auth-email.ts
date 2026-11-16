import { sendMail } from "@/lib/mail";
import { SITE_URL } from "@/lib/site-url";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** The email with the one-time link that lets an admin choose a password. */
export function sendAccessEmail(opts: { to: string; link: string; kind: "first" | "reset" }) {
  const first = opts.kind === "first";
  const title = first ? "Set up your WIS Admin login" : "Reset your WIS Admin password";
  const intro = first ? "You have been added as an admin of the Warrnambool Islamic Society website. Press the button to choose your password." : "Press the button to choose a new password.";
  const button = first ? "Choose my password" : "Choose a new password";
  return sendMail({
    to: opts.to,
    subject: title,
    text: `${title}\n\n${intro}\n\n${opts.link}\n\nThe link works once and expires in 1 hour. If you did not ask for this, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#121512">
  <table role="presentation" style="margin:0 0 20px;border-collapse:collapse"><tr>
    <td style="padding:0 12px 0 0"><img src="${SITE_URL}/logo.jpg" width="56" height="56" alt="Warrnambool Islamic Society" style="display:block;border-radius:28px"></td>
    <td style="font-size:16px;font-weight:bold;color:#0f6a4d">Warrnambool Islamic Society</td>
  </tr></table>
  <h1 style="margin:0 0 12px;font-size:22px">${title}</h1>
  <p style="font-size:16px;line-height:1.5">${intro}</p>
  <p style="margin:24px 0"><a href="${esc(opts.link)}" style="background:#0f8a63;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">${button}</a></p>
  <p style="font-size:13px;color:#666;line-height:1.5">The link works once and expires in 1 hour. If you did not ask for this, you can ignore this email and nothing will change.</p>
</div>`,
  });
}
