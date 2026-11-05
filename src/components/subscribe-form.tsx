"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function SubscribeForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const email = new FormData(e.currentTarget).get("email");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <p className="font-medium">
        Thank you. We will keep you posted, InshaAllah.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center border-b border-brand-dark/40 pb-2">
        <input
          name="email"
          type="email"
          required
          placeholder="Email address"
          className="w-full bg-transparent text-sm outline-none placeholder:text-brand-dark/50"
        />
        <button
          aria-label="Subscribe"
          disabled={status === "sending"}
          className="px-1 text-lg disabled:opacity-50"
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
