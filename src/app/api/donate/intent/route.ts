import { stripe } from "@/lib/stripe";

// Stripe subscription items need a product id, so keep one reusable product for monthly gifts.
let monthlyProductId: string | undefined;
async function getMonthlyProduct() {
  if (monthlyProductId) return monthlyProductId;
  const existing = (
    await stripe.products.list({ active: true, limit: 100 })
  ).data.find((p) => p.metadata.kind === "wis_monthly_donation");
  const product =
    existing ??
    (await stripe.products.create({
      name: "Monthly donation to Warrnambool Islamic Society",
      metadata: { kind: "wis_monthly_donation" },
    }));
  monthlyProductId = product.id;
  return product.id;
}

// Creates the payment (one-time) or subscription (monthly) and returns the client secret
// the embedded card form uses to confirm it.
export async function POST(req: Request) {
  const { amount, frequency, name, email, dedication } = await req.json();
  const dollars = Number(amount);
  if (!Number.isInteger(dollars) || dollars < 2 || dollars > 10000) {
    return Response.json(
      { error: "Amount must be a whole number from $2 to $10,000." },
      { status: 400 },
    );
  }
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  const metadata = {
    donor_name: String(name ?? "").slice(0, 100),
    dedication: String(dedication ?? "").slice(0, 200),
  };

  if (frequency === "monthly") {
    const customer = await stripe.customers.create({
      email,
      name: metadata.donor_name,
    });
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: "aud",
            product: await getMonthlyProduct(),
            unit_amount: dollars * 100,
            recurring: { interval: "month" },
          },
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      metadata,
      expand: ["latest_invoice.confirmation_secret"],
    });
    const invoice = subscription.latest_invoice;
    const clientSecret =
      invoice && typeof invoice !== "string"
        ? invoice.confirmation_secret?.client_secret
        : null;
    if (!clientSecret) {
      return Response.json(
        { error: "Could not start the monthly donation." },
        { status: 500 },
      );
    }
    return Response.json({ clientSecret });
  }

  const intent = await stripe.paymentIntents.create({
    amount: dollars * 100,
    currency: "aud",
    automatic_payment_methods: { enabled: true },
    receipt_email: email,
    description: "Donation to Warrnambool Islamic Society",
    metadata,
  });
  return Response.json({ clientSecret: intent.client_secret });
}
