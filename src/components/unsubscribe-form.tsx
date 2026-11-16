"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

// A button, not an automatic action, so an email scanner opening the link cannot unsubscribe anyone.
export function UnsubscribeForm() {
  const token = useSearchParams().get("t") ?? "";
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");

  async function unsubscribe() {
    setStatus("working");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (!token) return <p className="text-muted">This link is not valid. Please use the Unsubscribe link in the email.</p>;
  if (status === "done") {
    return (
      <p className="rounded-2xl bg-card p-5 text-lg font-medium">
        You have been unsubscribed. You will not get any more update emails from us.
      </p>
    );
  }
  return (
    <div className="max-w-md space-y-4">
      <p className="text-lg">Do you want to stop getting community update emails from Warrnambool Islamic Society?</p>
      <button
        type="button"
        onClick={unsubscribe}
        disabled={status === "working"}
        className="rounded-full bg-brand-gradient px-6 py-3 font-semibold text-brand-dark transition-[filter] hover:brightness-95 disabled:opacity-60"
      >
        {status === "working" ? "Please wait..." : "Yes, unsubscribe me"}
      </button>
      {status === "error" && <p className="text-sm text-red-700">Something went wrong, or this link is no longer valid. Please try again.</p>}
    </div>
  );
}
