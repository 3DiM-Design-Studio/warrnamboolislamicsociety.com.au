import { button, emailLayout, heading, note, paragraph } from "@/lib/email-template";
import { sendMail } from "@/lib/mail";

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

/** The email with the one-time link that lets an admin choose a password. */
export function sendAccessEmail(opts: { to: string; link: string; kind: AccessKind }) {
  const c = COPY[opts.kind];
  return sendMail({
    to: opts.to,
    subject: c.title,
    text: `${c.title}\n\n${c.intro}\n\n${opts.link}\n\nThe link works once and expires in 1 hour. If you did not expect this, you can ignore this email.`,
    html: emailLayout(
      [
        heading(c.title),
        paragraph(c.intro),
        button(opts.link, c.button),
        note("The link works once and expires in 1 hour. If it has expired, open the admin sign-in page and press &ldquo;First time here?&rdquo;. If you did not expect this email, you can ignore it."),
      ].join("\n"),
    ),
  });
}
