"use client";

import { useActionState } from "react";
import { joinMembership } from "@/lib/actions/membership";

export function MembershipForm() {
  const [state, action, pending] = useActionState(joinMembership, null);
  const field = "w-full rounded-xl border border-border bg-card px-4 py-3";

  if (state?.ok) {
    return <p className="rounded-2xl bg-card p-5 font-medium">{state.message}</p>;
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <input name="name" required placeholder="Full name" autoComplete="name" className={field} />
        {state?.errors?.name && <p className="mt-1 text-sm text-red-700">{state.errors.name}</p>}
      </div>
      <div>
        <input name="email" type="email" required placeholder="Email" autoComplete="email" className={field} />
        {state?.errors?.email && <p className="mt-1 text-sm text-red-700">{state.errors.email}</p>}
      </div>
      <div>
        <input name="phone" type="tel" placeholder="Phone (optional)" autoComplete="tel" className={field} />
        {state?.errors?.phone && <p className="mt-1 text-sm text-red-700">{state.errors.phone}</p>}
      </div>
      {/* Honeypot: hidden from people, filled in by bots */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <button
        disabled={pending}
        className="rounded-full bg-brand-gradient px-6 py-3 font-semibold text-brand-dark disabled:opacity-60"
      >
        {pending ? "Sending..." : "Join"}
      </button>
      {state && !state.ok && !state.errors && <p className="text-red-700">{state.message}</p>}
    </form>
  );
}
