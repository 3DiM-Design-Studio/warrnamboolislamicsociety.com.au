"use client";

import { Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { ArrowLeft, Check, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PaymentFields } from "@/components/payment-panel";
import { stripePromise } from "@/lib/stripe-client";

type Fields = {
  amount: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  suburb: string;
  postcode: string;
  showSpouse: boolean;
  spouse: string;
  children: string[];
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
  const [step, setStep] = useState(0);

  const value = Number(fields.amount) || 0;
  const valid = Number.isInteger(value) && value >= 2 && value <= 10000;

  useEffect(() => {
    if (elements && valid) elements.update({ amount: value * 100 });
  }, [elements, value, valid]);

  const aboutValid =
    fields.firstName.trim() !== "" &&
    fields.lastName.trim() !== "" &&
    /^\S+@\S+\.\S+$/.test(fields.email) &&
    fields.address.trim() !== "" &&
    fields.suburb.trim() !== "" &&
    /^\d{4}$/.test(fields.postcode);
  const stepValid = [aboutValid, true, valid, true][step];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 3) {
      if (stepValid) setStep(step + 1);
      return;
    }
    if (!stripe || !elements || !valid) return;
    setBusy(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Please check your payment details.");
      setBusy(false);
      return;
    }

    const res = await fetch("/api/membership/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        amount: value,
        spouse: fields.showSpouse ? fields.spouse : "",
        familyMembers: String(
          1 + (fields.showSpouse ? 1 : 0) + fields.children.length,
        ),
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
        return_url: `${window.location.origin}/membership/thank-you`,
        payment_method_data: {
          billing_details: {
            name: `${fields.firstName} ${fields.lastName}`.trim(),
            email: fields.email,
          },
        },
      },
    });
    // Only reached on error; on success the browser is redirected.
    setError(confirmError.message ?? "Your payment could not be completed.");
    setBusy(false);
  }

  const text = (
    key: "firstName" | "lastName" | "phone" | "email" | "spouse" | "address" | "suburb" | "postcode",
    placeholder: string,
    extra: { required?: boolean; type?: string; autoComplete?: string; inputMode?: "numeric"; maxLength?: number } = {},
  ) => (
    <input
      value={fields[key]}
      onChange={(e) => set(key, e.target.value)}
      placeholder={placeholder}
      className={input}
      {...extra}
    />
  );

  const steps = ["About you", "Family", "Amount", "Payment"];
  const intros = [
    {
      title: "Tell us about yourself",
      sub: "Please let us know who is joining the society.",
    },
    {
      title: "Who is joining with you?",
      sub: "Optional. Add your spouse and children if you would like them included.",
    },
    {
      title: "Choose your contribution",
      sub: "You choose the amount. This is a one-off payment.",
    },
    {
      title: "Complete your payment",
      sub: "Pay with a card, or with Google Pay or Apple Pay where your device offers it.",
    },
  ];

  return (
    <form
      onSubmit={submit}
      className="grid md:h-[38rem] md:grid-cols-[1fr_38rem]"
    >
      <div className="relative h-44 md:h-auto">
        <Image
          src="/membership.jpg"
          alt="Community members greeting each other inside the mosque"
          fill
          sizes="(min-width: 768px) 60vw, 100vw"
          className="object-cover object-[55%_50%]"
        />
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-6 p-6 sm:px-8">
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                aria-label="Previous step"
                className="grid size-8 place-items-center rounded-full hover:bg-background"
              >
                <ArrowLeft className="size-5" aria-hidden />
              </button>
            ) : (
              <Link
                href="/"
                aria-label="Back to home"
                className="grid size-8 place-items-center rounded-full hover:bg-background"
              >
                <ArrowLeft className="size-5" aria-hidden />
              </Link>
            )}
            <span className="text-sm font-medium text-muted">
              Join the society
            </span>
          </div>

          <ol className="flex items-center gap-1.5">
            {steps.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={label} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!done}
                    onClick={() => setStep(i)}
                    aria-current={active ? "step" : undefined}
                    className="flex items-center disabled:cursor-default"
                  >
                    <span
                      className={`grid size-9 place-items-center rounded-full text-xs font-bold lg:size-7 ${
                        active
                          ? "bg-[#16c05a] text-white"
                          : done
                            ? "border-2 border-[#16c05a] bg-white text-[#16c05a]"
                            : "bg-background text-muted"
                      }`}
                    >
                      {done ? (
                        <Check className="size-3.5" aria-hidden />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="sr-only">{label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <span
                      className={`h-0.5 w-5 rounded ${done ? "bg-[#16c05a]" : "bg-border"}`}
                      aria-hidden
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="min-h-[26rem] flex-1 overflow-y-auto px-6 pb-6 pt-2 sm:px-8 md:min-h-0">
          <p className="text-sm font-medium text-muted">
            Step {step + 1}/{steps.length}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {intros[step].title}
          </h2>
          <p className="mb-5 mt-1 text-sm text-muted">{intros[step].sub}</p>
          {step === 0 && (
            <div>
              <div className="grid gap-3 sm:grid-cols-2">
                {text("firstName", "First name", {
                  required: true,
                  autoComplete: "given-name",
                })}
                {text("lastName", "Last name", {
                  required: true,
                  autoComplete: "family-name",
                })}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {text("phone", "Phone", { type: "tel", autoComplete: "tel" })}
                {text("email", "Email", {
                  required: true,
                  type: "email",
                  autoComplete: "email",
                })}
              </div>
              <div className="mt-3 grid gap-3">
                {text("address", "Street address", {
                  required: true,
                  autoComplete: "street-address",
                })}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {text("suburb", "Suburb", {
                  required: true,
                  autoComplete: "address-level2",
                })}
                {text("postcode", "Postcode", {
                  required: true,
                  inputMode: "numeric",
                  maxLength: 4,
                  autoComplete: "postal-code",
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              {fields.showSpouse && (
                <div className="flex items-center gap-2">
                  {text("spouse", "Spouse")}
                  <button
                    type="button"
                    onClick={() => {
                      set("showSpouse", false);
                      set("spouse", "");
                    }}
                    aria-label="Remove spouse"
                    className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-background"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              )}
              {fields.children.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={c}
                    onChange={(e) =>
                      set(
                        "children",
                        fields.children.map((v, j) =>
                          j === i ? e.target.value : v,
                        ),
                      )
                    }
                    placeholder={`Child ${i + 1}`}
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "children",
                        fields.children.filter((_, j) => j !== i),
                      )
                    }
                    aria-label={`Remove child ${i + 1}`}
                    className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-background"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                {!fields.showSpouse && (
                  <button
                    type="button"
                    onClick={() => set("showSpouse", true)}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-brand-dark/30 px-4 py-2 font-medium hover:border-brand-dark"
                  >
                    <Plus className="size-4" aria-hidden />
                    Add spouse
                  </button>
                )}
                {fields.children.length < 5 && (
                  <button
                    type="button"
                    onClick={() => set("children", [...fields.children, ""])}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-brand-dark/30 px-4 py-2 font-medium hover:border-brand-dark"
                  >
                    <Plus className="size-4" aria-hidden />
                    Add child
                  </button>
                )}
              </div>
              <p className="text-sm text-muted">
                Family members on this membership:{" "}
                <strong className="text-brand-dark">
                  {1 + (fields.showSpouse ? 1 : 0) + fields.children.length}
                </strong>{" "}
                (including you)
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="flex items-center gap-2 rounded-xl bg-background px-5 py-4">
                <span className="text-3xl font-bold">$</span>
                <input
                  inputMode="numeric"
                  value={fields.amount}
                  onChange={(e) =>
                    set("amount", e.target.value.replace(/\D/g, "").slice(0, 5))
                  }
                  aria-label="Membership contribution in Australian dollars"
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
              <p className="mt-3 text-sm text-muted">
                You choose the amount. This is a one-off payment of{" "}
                <strong className="text-brand-dark">
                  ${valid ? value : 0} AUD
                </strong>
                .
              </p>
            </div>
          )}

          {/* Always mounted (just hidden before the last step) so the card field loads early
              and keeps what was typed when going back and forward. */}
          <div className={step === 3 ? "" : "hidden"}>
            <PaymentFields heading={false} />
          </div>
        </div>

        {error && (
          <p className="border-t border-border px-6 py-3 text-sm text-red-700 sm:px-8">
            {error}
          </p>
        )}
        <div className="flex items-center justify-end gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-brand-dark"
            >
              Back
            </button>
          )}
          <button
            disabled={
              !stepValid || busy || (step === 3 && (!stripe || !elements))
            }
            className="rounded-lg bg-[#16c05a] px-8 py-2.5 font-semibold text-white transition-[filter] hover:brightness-95 disabled:opacity-50"
          >
            {step < 3
              ? "Next"
              : busy
                ? "Processing..."
                : `Join and pay $${valid ? value : 0}`}
          </button>
        </div>
      </div>
    </form>
  );
}

export function MembershipForm() {
  const [fields, setFields] = useState<Fields>({
    amount: "50",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    suburb: "",
    postcode: "",
    showSpouse: false,
    spouse: "",
    children: [],
  });
  const set = <K extends keyof Fields>(key: K, value: Fields[K]) =>
    setFields((f) => ({ ...f, [key]: value }));
  const value = Number(fields.amount) || 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-card">
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
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
