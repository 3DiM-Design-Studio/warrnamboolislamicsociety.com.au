"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function SubscribeForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "already" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const website = form.get("website");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const body = await res.json().catch(() => null);
      setStatus(!res.ok ? "error" : body?.already ? "already" : "sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="font-medium">
        Thank you. We will keep you posted, InshaAllah.
      </p>
    );
  }
  if (status === "already") {
    return (
      <p className="font-medium">
        This email is already subscribed here. You will keep getting our
        updates, InshaAllah.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="flex items-center border-b border-brand-dark/40 pb-2">
        <input
          name="email"
          type="email"
          required
          aria-label="Your email address"
          autoComplete="email"
          placeholder="Email address"
          className="w-full bg-transparent py-3 text-base outline-none placeholder:text-brand-dark/50"
        />
        <button
          aria-label="Subscribe"
          disabled={status === "sending"}
          className="grid size-11 shrink-0 place-items-center text-lg disabled:opacity-50"
        >
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-700">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
