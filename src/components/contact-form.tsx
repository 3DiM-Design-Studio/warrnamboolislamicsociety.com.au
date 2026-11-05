"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  const field = "w-full rounded border border-border bg-card px-3 py-2";

  if (status === "sent") return <p className="font-medium text-brand">Thank you, we have received your message.</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input name="name" required placeholder="Name" className={field} />
      <input name="email" type="email" required placeholder="Email" className={field} />
      <textarea name="message" required rows={5} placeholder="Message" className={field} />
      <button
        disabled={status === "sending"}
        className="rounded bg-brand px-5 py-2 font-medium text-white disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send"}
      </button>
      {status === "error" && <p className="text-red-700">Something went wrong. Please try again.</p>}
    </form>
  );
}
