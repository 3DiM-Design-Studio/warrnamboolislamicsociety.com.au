import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAnonClient, hasSupabase } from "@/lib/supabase/anon";
import { sendDonationReceipt } from "@/lib/receipt-email";

type Metadata = Record<string, string> | null | undefined;

// Stripe calls this every time a donation is paid: once for a one-time gift, and every month
// for a monthly gift. Each payment becomes one row in the admin's Donations list.
async function record(
  md: Metadata,
  payment: { amount: number; created: number; payment_intent?: string; invoice_id?: string; subscription_id?: string },
) {
  if (md?.kind !== "donation" || payment.amount <= 0) return;
  const { error } = await createAnonClient()
    .from("donations")
    .insert({
      donor_name: md.donor_name ?? "",
      email: md.donor_email ?? "",
      phone: md.phone ?? "",
      amount_cents: payment.amount,
      frequency: payment.subscription_id ? "monthly" : "once",
      anonymous: md.anonymous === "yes",
      wants_receipt: md.wants_receipt !== "no",
      dedication: md.dedication ?? "",
      payment_intent: payment.payment_intent ?? null,
      subscription_id: payment.subscription_id ?? null,
      invoice_id: payment.invoice_id ?? null,
      // YYYY-MM-DD in Melbourne time, from when Stripe took the payment.
      submitted_date: new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne" }).format(new Date(payment.created * 1000)),
    });
  // 23505 = this payment was already saved (Stripe sends some messages twice): nothing to do, and no second receipt.
  if (error && error.code === "23505") return;
  if (error) throw new Error(error.message);

  // The donor asked for a receipt (the form's default is yes). Sent only once, when the gift is first saved.
  const email = (md.donor_email ?? "").trim();
  if (md.wants_receipt !== "no" && /^S+@S+.S+$/.test(email)) {
    const receiptNo = "WIS-" + (payment.payment_intent ?? payment.invoice_id ?? "").replace(/^(pi_|in_)/, "").slice(-8).toUpperCase();
    await sendDonationReceipt({
      to: email,
      // The donor always sees their own name on their receipt; "anonymous" only hides it from the admin list.
      name: md.donor_name || "Friend",
      amountCents: payment.amount,
      date: new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne" }).format(new Date(payment.created * 1000)),
      monthly: Boolean(payment.subscription_id),
      receiptNo,
    });
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return Response.json({ error: "Webhook is not set up." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }
  if (!hasSupabase) return Response.json({ received: true });

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      await record(pi.metadata, { amount: pi.amount, created: event.created, payment_intent: pi.id });
    } else if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      const sub = invoice.parent?.subscription_details;
      if (sub) {
        await record(sub.metadata, {
          amount: invoice.amount_paid,
          created: event.created,
          invoice_id: invoice.id,
          subscription_id: typeof sub.subscription === "string" ? sub.subscription : sub.subscription.id,
        });
      }
    }
  } catch (e) {
    // A 500 makes Stripe try again later, so a short database problem does not lose a donation.
    console.error("Could not save donation", event.id, e);
    return Response.json({ error: "Could not save." }, { status: 500 });
  }
  return Response.json({ received: true });
}
