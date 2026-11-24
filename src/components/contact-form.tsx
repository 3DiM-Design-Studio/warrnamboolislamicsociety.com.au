"use client";

import { ArrowLeft, Clock, Mail, Phone, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { SocialRow } from "@/components/social-links";

const input =
  "w-full rounded-xl border-2 border-border bg-white px-4 py-3 outline-none focus:border-brand-dark";

export type ContactDetails = { email: string; phones: string[]; jumuah: string; facebook?: string; whatsapp?: string };

export function ContactForm({ contact }: { contact: ContactDetails }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  // Next.js keeps a visited page alive in the background, so the form must never be left half-way when we move to the thank-you page.
  const [opening, startOpening] = useTransition();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        // Empty the form and put it back to normal now. While the thank-you page opens, "opening" keeps the button on "Sending...".
        formRef.current?.reset();
        setError("");
        setStatus("idle");
        startOpening(() => router.push("/contact/thank-you"));
        return;
      }
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    }
    setStatus("error");
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card">
      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 p-6 sm:px-8">
            <Link
              href="/"
              aria-label="Back to home"
              className="grid size-11 place-items-center rounded-full hover:bg-background"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
            <span className="text-sm font-medium text-muted">Contact us</span>
          </div>

          <form ref={formRef} onSubmit={onSubmit} className="flex flex-1 flex-col">
              <div className="flex-1 px-6 pb-6 pt-2 sm:px-8">
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
                    maxLength={120}
                    placeholder="Name"
                    autoComplete="name"
                    className={input}
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    placeholder="Email"
                    autoComplete="email"
                    className={input}
                  />
                  <textarea
                    name="message"
                    required
                    rows={6}
                    maxLength={5000}
                    placeholder="Message"
                    className={`${input} resize-none`}
                  />
                  {/* Spam trap: hidden from people, filled in by bots. */}
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="absolute -left-[9999px] size-px opacity-0"
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="border-t border-border px-6 py-3 text-sm text-red-700 sm:px-8">
                  {error}
                </p>
              )}
              <div className="flex items-center justify-end px-6 pb-6 sm:px-8 sm:pb-8">
                <button
                  disabled={status === "sending" || opening}
                  className="btn-primary"
                >
                  {status === "sending" || opening ? "Sending..." : "Send message"}
                </button>
              </div>
          </form>
        </div>

        <div className="flex flex-col border-t border-border text-brand-dark lg:border-l lg:border-t-0">
          <div className="flex flex-1 flex-col justify-center gap-7 p-6 sm:p-10">
            <div className="flex gap-4">
              <Mail className="mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium opacity-70">Email</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="link-fx inline-block py-2.5 font-semibold"
                >
                  {contact.email}
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium opacity-70">Phone</p>
                <div className="@container">
                <ul className="grid grid-cols-1 gap-x-6 @[17rem]:grid-cols-2">
                  {contact.phones.map((n) => (
                    <li key={n}>
                      <a
                        href={`tel:${n.replace(/\s/g, "")}`}
                        className="link-fx inline-block whitespace-nowrap py-2.5 text-[15px] font-semibold sm:text-base"
                      >
                        {n}
                      </a>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium opacity-70">Jumu&apos;ah</p>
                <p className="font-semibold">{contact.jumuah}</p>
              </div>
            </div>
            {(contact.facebook || contact.whatsapp) && (
              <div className="flex gap-4">
                <Users className="mt-1 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="mb-2 text-sm font-medium opacity-70">You can also find us on</p>
                  <SocialRow facebook={contact.facebook} whatsapp={contact.whatsapp} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <iframe
        title="Map showing Warrnambool Islamic Society"
        src="https://www.google.com/maps?q=Warrnambool+Islamic+Society,+Warrnambool+VIC&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-72 w-full border-0 border-t border-border sm:h-80 lg:h-96"
      />
    </div>
  );
}
