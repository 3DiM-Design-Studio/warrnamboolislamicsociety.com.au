"use client";

import { Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { PaymentPanel } from "@/components/payment-panel";
import { stripePromise } from "@/lib/stripe-client";

type Frequency = "monthly" | "once";

type Fields = {
  frequency: Frequency;
  amount: string;
  name: string;
  email: string;
  phone: string;
  anonymous: boolean;
  receipt: boolean;
  dedicate: boolean;
  dedication: string;
};

const adds = [10, 25, 50, 100];
const input =
  "w-full rounded-xl border-2 border-border bg-white px-4 py-3 outline-none focus:border-brand-dark";

function Card({
  fields,
  set,
}: {
  fields: Fields;
  set: <K extends keyof Fields>(key: K, value: Fields[K]) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { frequency, name, email, phone, anonymous, receipt, dedicate, dedication } = fields;
  const value = Number(fields.amount) || 0;
  const valid = Number.isInteger(value) && value >= 2 && value <= 10000;

  // Keep the card form's amount in step with the amount box.
  useEffect(() => {
    if (elements && valid) elements.update({ amount: value * 100 });
  }, [elements, value, valid]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !valid) return;
    setBusy(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Please check your payment details.");
      setBusy(false);
      return;
    }

    const res = await fetch("/api/donate/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: value,
        frequency,
        name,
        email,
        phone,
        anonymous,
        receipt,
        dedication: dedicate ? dedication : "",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      setBusy(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret: data.clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/donate/thank-you`,
        payment_method_data: { billing_details: { name, email } },
      },
    });
    // Only reached on error; on success the browser is redirected.
    setError(confirmError.message ?? "Your payment could not be completed.");
    setBusy(false);
  }

  const seg = (active: boolean) =>
    `flex-1 px-4 py-3 text-center font-semibold transition-colors ${
      active ? "bg-brand-dark text-white" : "bg-white hover:bg-background"
    }`;

  return (
    <form onSubmit={submit}>
      <div className="grid md:grid-cols-[1fr_1.1fr]">
        <PaymentPanel />

        {/* Amount and donor details */}
        <div className="p-6 sm:p-8">
          <p className="font-bold">Frequency</p>
          <div
            className="mt-3 flex overflow-hidden rounded-xl border-2 border-brand-dark"
            role="group"
            aria-label="Frequency"
          >
            <button
              type="button"
              onClick={() => set("frequency", "monthly")}
              aria-pressed={frequency === "monthly"}
              className={seg(frequency === "monthly")}
            >
              Give Monthly
            </button>
            <button
              type="button"
              onClick={() => set("frequency", "once")}
              aria-pressed={frequency === "once"}
              className={seg(frequency === "once")}
            >
              Once
            </button>
          </div>
          <p className="mt-3 text-sm text-muted">
            {frequency === "monthly" ? (
              <>
                <strong className="text-brand-dark">Monthly donations</strong>{" "}
                give the society steady support to plan ahead. Cancel anytime by
                contacting us.
              </>
            ) : (
              <>
                <strong className="text-brand-dark">A one-time gift</strong>{" "}
                goes straight towards our community and the new place of
                worship.
              </>
            )}
          </p>

          <p className="mt-6 font-bold">Amount</p>
          <label className="mt-3 flex items-center gap-2 rounded-xl bg-background px-5 py-4">
            <span className="text-3xl font-bold">$</span>
            <input
              inputMode="numeric"
              value={fields.amount}
              onChange={(e) =>
                set("amount", e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              aria-label="Donation amount in Australian dollars"
              className="w-full bg-transparent text-3xl font-bold outline-none"
            />
            <span className="font-bold text-[#0f8a63]">AUD</span>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {adds.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() =>
                  set("amount", String(Math.min(10000, value + a)))
                }
                className="rounded-full border-2 border-brand-dark/30 px-4 py-1.5 font-medium hover:border-brand-dark"
              >
                +{a}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="Full name"
              autoComplete="name"
              className={input}
            />
            <input
              value={email}
              onChange={(e) => set("email", e.target.value)}
              required
              type="email"
              placeholder="Email"
              autoComplete="email"
              className={input}
            />
          </div>
          <input
            value={phone}
            onChange={(e) => set("phone", e.target.value)}
            type="tel"
            maxLength={40}
            placeholder="Phone number (optional)"
            autoComplete="tel"
            className={`${input} mt-3`}
          />

          <label className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              checked={receipt}
              onChange={(e) => set("receipt", e.target.checked)}
              className="size-5 rounded border-2 border-brand-dark accent-brand-dark"
            />
            Email me a receipt
          </label>
          <label className="mt-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => set("anonymous", e.target.checked)}
              className="size-5 rounded border-2 border-brand-dark accent-brand-dark"
            />
            Make my donation anonymous
          </label>

          <label className="mt-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={dedicate}
              onChange={(e) => set("dedicate", e.target.checked)}
              className="size-5 rounded border-2 border-brand-dark accent-brand-dark"
            />
            Dedicate this donation
          </label>
          {dedicate && (
            <input
              value={dedication}
              onChange={(e) => set("dedication", e.target.value)}
              placeholder="In honour or memory of..."
              className={`${input} mt-3`}
            />
          )}
        </div>
      </div>

      {error && (
        <p className="border-t border-border px-6 py-3 text-sm text-red-700 sm:px-8">
          {error}
        </p>
      )}
      <button
        disabled={!stripe || !elements || busy || !valid}
        className="block w-full bg-brand-gradient px-6 py-7 text-xl font-semibold text-brand-dark transition-[filter] hover:brightness-95 disabled:opacity-60"
      >
        {busy
          ? "Processing..."
          : `Donate $${valid ? value : 0}${frequency === "monthly" ? " every month" : ""}`}
      </button>
    </form>
  );
}

export function DonateForm() {
  const [fields, setFields] = useState<Fields>({
    frequency: "once",
    amount: "50",
    name: "",
    email: "",
    phone: "",
    anonymous: false,
    receipt: true,
    dedicate: false,
    dedication: "",
  });
  const set = <K extends keyof Fields>(key: K, value: Fields[K]) =>
    setFields((f) => ({ ...f, [key]: value }));
  const value = Number(fields.amount) || 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-card">
      {/* Elements is re-created when the frequency changes; the form values live out here so they survive. */}
      <Elements
        key={fields.frequency}
        stripe={stripePromise}
        options={{
          mode: fields.frequency === "monthly" ? "subscription" : "payment",
          amount: Math.max(value, 2) * 100,
          currency: "aud",
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#0f8a63",
              colorText: "#121512",
              borderRadius: "12px",
            },
          },
        }}
      >
        <Card fields={fields} set={set} />
      </Elements>
    </div>
  );
}
