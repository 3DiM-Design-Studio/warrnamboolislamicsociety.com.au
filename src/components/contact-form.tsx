"use client";

import { ArrowLeft, Check, Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { site } from "@/content/site";

const input =
  "w-full rounded-xl border-2 border-border bg-white px-4 py-3 outline-none focus:border-brand-dark";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

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

  return (
    <div className="overflow-hidden rounded-2xl bg-card">
      <div className="grid md:h-[38rem] md:grid-cols-[38rem_1fr]">
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 p-6 sm:px-8">
            <Link
              href="/"
              aria-label="Back to home"
              className="grid size-8 place-items-center rounded-full hover:bg-background"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
            <span className="text-sm font-medium text-muted">Contact us</span>
          </div>

          {status === "sent" ? (
            <div className="flex flex-1 flex-col items-start px-6 pb-8 pt-2 sm:px-8">
              <span className="grid size-10 place-items-center rounded-full bg-[#16c05a] text-white">
                <Check className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Thank you, we have your message
              </h2>
              <p className="mt-1 text-sm text-muted">
                We will get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 sm:px-8">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Send us a message
                </h2>
                <p className="mb-5 mt-1 text-sm text-muted">
                  Tell us how we can help and we will reply by email.
                </p>
                <div className="space-y-3">
                  <input
                    name="name"
                    required
                    placeholder="Name"
                    autoComplete="name"
                    className={input}
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email"
                    autoComplete="email"
                    className={input}
                  />
                  <textarea
                    name="message"
                    required
                    rows={6}
                    placeholder="Message"
                    className={`${input} resize-none`}
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="border-t border-border px-6 py-3 text-sm text-red-700 sm:px-8">
                  Something went wrong. Please try again.
                </p>
              )}
              <div className="flex items-center justify-end px-6 pb-6 sm:px-8 sm:pb-8">
                <button
                  disabled={status === "sending"}
                  className="rounded-lg bg-[#16c05a] px-8 py-2.5 font-semibold text-white transition-[filter] hover:brightness-95 disabled:opacity-50"
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex min-h-0 flex-col border-t border-border text-brand-dark md:border-l md:border-t-0">
          <div className="flex flex-col justify-center gap-8 p-8 sm:p-10">
            <div className="flex gap-4">
              <Mail className="mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium opacity-70">Email</p>
                <a
                  href={`mailto:${site.email}`}
                  className="link-fx font-semibold"
                >
                  {site.email}
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium opacity-70">Phone</p>
                <ul className="space-y-1">
                  {site.phones.map((n) => (
                    <li key={n}>
                      <a
                        href={`tel:${n.replace(/\s/g, "")}`}
                        className="link-fx font-semibold"
                      >
                        {n}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium opacity-70">Jumu&apos;ah</p>
                <p className="font-semibold">{site.jumuah}</p>
              </div>
            </div>
          </div>
          <iframe
            title="Map showing Warrnambool Islamic Society"
            src="https://www.google.com/maps?q=Warrnambool+Islamic+Society,+Warrnambool+VIC&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full flex-1 border-0 md:h-auto md:min-h-64"
          />
        </div>
      </div>
    </div>
  );
}
