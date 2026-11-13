import { sendMail } from "@/lib/mail";
import { createAnonClient, hasSupabase } from "@/lib/supabase/anon";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// Saves a message from the Contact page to the contacts table (the admin panel reads it from there),
// then emails the committee as a bonus. The message is stored first, so an email problem never loses it.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Please fill in the form and try again." }, { status: 400 });
  }

  // Hidden "website" field: people never see it, spam bots fill it in. Pretend it worked and drop it.
  if (clean(body.website)) return Response.json({ ok: true });

  const name = clean(body.name);
  const email = clean(body.email);
  const message = clean(body.message);
  if (!name || !email || !message) {
    return Response.json({ error: "Please fill in your name, email and message." }, { status: 400 });
  }
  if (name.length > 120 || email.length > 200 || message.length > 5000) {
    return Response.json({ error: "That message is too long. Please shorten it and try again." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!hasSupabase) {
    console.error("Contact message not saved: Supabase is not set up");
    return Response.json({ error: "Sorry, we could not send your message. Please try again later." }, { status: 503 });
  }
  // Visitors may only add rows (never read them), so there is nothing to select back.
  // The day is set here in Melbourne time (the database's own clock is UTC, which can be a day behind).
  const submitted_date = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne" }).format(new Date());
  const { error } = await createAnonClient().from("contacts").insert({ name, email, message, status: "new", submitted_date });
  if (error) {
    console.error("Could not save contact message", error.message);
    return Response.json({ error: "Sorry, we could not send your message. Please try again later." }, { status: 500 });
  }

  // Optional alert. Skipped when no mail server is set up, and never shown to the visitor if it fails.
  if (process.env.SMTP_HOST && process.env.MAIL_FROM) {
    try {
      await sendMail({
        to: process.env.MAIL_FROM,
        replyTo: email,
        subject: `Website enquiry from ${name.replace(/[\r\n]+/g, " ")}`,
        html: `<p>${esc(name)} &lt;${esc(email)}&gt;</p><p>${esc(message).replace(/\n/g, "<br>")}</p>`,
      });
    } catch (e) {
      console.error("Contact email alert failed", e);
    }
  }
  return Response.json({ ok: true });
}
