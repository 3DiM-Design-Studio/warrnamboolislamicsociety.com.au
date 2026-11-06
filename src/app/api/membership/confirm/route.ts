import { sendMail } from "@/lib/mail";
import { stripe } from "@/lib/stripe";

const esc = (s: string) => s.replace(/[<>&]/g, "");

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
