import { stripe } from "@/lib/stripe";

type Member = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  familyMembers: string;
  spouse: string;
  children: string[];
};

const clean = (v: unknown, max = 100) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

// Starts a one-off membership payment. The member's details travel on the payment's metadata so
// the society can be emailed once the payment succeeds (see /api/membership/confirm).
export async function POST(req: Request) {
  const body = await req.json();
  const dollars = Number(body.amount);
  if (!Number.isInteger(dollars) || dollars < 2 || dollars > 10000) {
    return Response.json(
      { error: "Amount must be a whole number from $2 to $10,000." },
      { status: 400 },
    );
  }
  const m: Member = {
    firstName: clean(body.firstName),
    lastName: clean(body.lastName),
    phone: clean(body.phone, 30),
    email: clean(body.email, 150),
    familyMembers: clean(body.familyMembers, 3),
    spouse: clean(body.spouse),
    children: (Array.isArray(body.children) ? body.children : [])
      .slice(0, 5)
      .map((c: unknown) => clean(c)),
  };
  if (!m.firstName || !m.lastName || !/^\S+@\S+\.\S+$/.test(m.email)) {
    return Response.json(
      { error: "Please enter your name and a valid email address." },
      { status: 400 },
    );
  }

  const intent = await stripe.paymentIntents.create({
    amount: dollars * 100,
    currency: "aud",
    automatic_payment_methods: { enabled: true },
    receipt_email: m.email,
    description: "Membership of Warrnambool Islamic Society",
    metadata: {
      kind: "membership",
      member: `${m.firstName} ${m.lastName} | ${m.email} | ${m.phone}`,
      family:
        `${m.familyMembers || "-"} members | spouse: ${m.spouse || "-"} | children: ${
          m.children.filter(Boolean).join(", ") || "-"
        }`.slice(0, 500),
    },
  });
  return Response.json({ clientSecret: intent.client_secret });
}
