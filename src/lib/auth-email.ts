import { sendMail } from "@/lib/mail";
import { SITE_URL } from "@/lib/site-url";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Why the email is being sent. Each one has its own words. */
export type AccessKind = "first" | "reset" | "invited" | "approved";

const COPY: Record<AccessKind, { title: string; intro: string; button: string }> = {
  first: {
    title: "Set up your WIS Admin login",
    intro: "You are on the admin list of the Warrnambool Islamic Society website. Press the button to choose your password.",
    button: "Choose my password",
  },
  reset: { title: "Reset your WIS Admin password", intro: "Press the button to choose a new password.", button: "Choose a new password" },
  invited: {
    title: "You have been added as a WIS admin",
    intro: "An admin added you to the Warrnambool Islamic Society website admin list. Press the button to choose your password and sign in.",
    button: "Choose my password",
  },
  approved: {
    title: "Your request was approved",
    intro: "Your request to become an admin of the Warrnambool Islamic Society website was approved. Press the button to choose your password and sign in.",
    button: "Choose my password",
  },
};

const frame = (inner: string) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#121512">
  <table role="presentation" style="margin:0 0 20px;border-collapse:collapse"><tr>
    <td style="padding:0 12px 0 0"><img src="${SITE_URL}/logo.jpg" width="56" height="56" alt="Warrnambool Islamic Society" style="display:block;border-radius:28px"></td>
    <td style="font-size:16px;font-weight:bold;color:#0f6a4d">Warrnambool Islamic Society</td>
  </tr></table>
  ${inner}
</div>`;

const buttonHtml = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="background:#0f8a63;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">${label}</a></p>`;

/** The email with the one-time link that lets an admin choose a password. */
export function sendAccessEmail(opts: { to: string; link: string; kind: AccessKind }) {
  const c = COPY[opts.kind];
  return sendMail({
    to: opts.to,
    subject: c.title,
    text: `${c.title}\n\n${c.intro}\n\n${opts.link}\n\nThe link works once and expires in 1 hour. If you did not expect this, you can ignore this email.`,
    html: frame(`<h1 style="margin:0 0 12px;font-size:22px">${c.title}</h1>
  <p style="font-size:16px;line-height:1.5">${c.intro}</p>
  ${buttonHtml(opts.link, c.button)}
  <p style="font-size:13px;color:#666;line-height:1.5">The link works once and expires in 1 hour. If it has expired, open the admin sign-in page and press &ldquo;First time here?&rdquo;. If you did not expect this email, you can ignore it.</p>`),
  });
}
