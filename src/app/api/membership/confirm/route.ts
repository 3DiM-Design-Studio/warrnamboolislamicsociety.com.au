import type Stripe from "stripe";
import { sendMail } from "@/lib/mail";
import { stripe } from "@/lib/stripe";
import { createAnonClient, hasSupabase } from "@/lib/supabase/anon";

const esc = (s: string) => s.replace(/[<>&]/g, "");

// Saves a paid membership to the admin's Members list, once per payment (the payment id is unique).
// A problem here must never show the member an error: their payment already went through.
async function recordMember(pi: Stripe.PaymentIntent) {
  if (!hasSupabase) return;
  const [name = "", email = "", phone = ""] = (pi.metadata.member ?? "").split("|").map((v) => v.trim());
  try {
    // Plain insert: visitors may add rows but not read them. A repeat of the same payment hits the
    // unique payment_intent column (code 23505) and is simply ignored.
    const { error } = await createAnonClient()
      .from("members")
      .insert({ name, email, phone, details: pi.metadata.family ?? "", amount_cents: pi.amount, status: "new", payment_intent: pi.id });
    if (error && error.code !== "23505") console.error("Could not save member", pi.id, error.message);
  } catch (e) {
    console.error("Could not save member", pi.id, e);
  }
}

// Called from the thank-you page. Confirms the payment really succeeded, then emails the
// society the member's details once (the payment is marked so a refresh doesn't resend).
export async function POST(req: Request) {
  const { paymentIntent } = await req.json();
  if (typeof paymentIntent !== "string" || !paymentIntent.startsWith("pi_")) {
    return Response.json({ error: "Invalid payment." }, { status: 400 });
  }
  const pi = await stripe.paymentIntents.retrieve(paymentIntent);
  if (pi.metadata.kind !== "membership") {
    return Response.json(
      { error: "Not a membership payment." },
      { status: 400 },
    );
  }
  if (pi.status !== "succeeded") {
    return Response.json({ status: pi.status });
  }
  await recordMember(pi);
  if (pi.metadata.notified !== "1") {
    // The payment already succeeded, so an email problem must not show the member an error.
    // "notified" stays unset on failure, so the next page load tries the email again.
    try {
      await sendMail({
        to: process.env.MAIL_FROM!,
        subject: "New member registration",
        html: `<h2>New member registration</h2>
        <p><strong>Paid:</strong> $${(pi.amount / 100).toFixed(2)} AUD</p>
        <p><strong>Member:</strong> ${esc(pi.metadata.member ?? "")}</p>
        <p><strong>Family:</strong> ${esc(pi.metadata.family ?? "")}</p>
        <p>Stripe payment: ${pi.id}</p>`,
      });
      await stripe.paymentIntents.update(pi.id, {
        metadata: { ...pi.metadata, notified: "1" },
      });
    } catch (e) {
      console.error("Membership email failed for", pi.id, e);
    }
  }
  // Metadata starts with "First Last | email | phone"; only the name goes back to the page.
  const name = (pi.metadata.member ?? "").split("|")[0].trim();
  return Response.json({ status: "succeeded", name });
}
