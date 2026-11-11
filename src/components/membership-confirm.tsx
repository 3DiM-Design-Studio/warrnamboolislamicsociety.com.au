"use client";

import { Download } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Confirms the payment with the server (which emails the committee once) and shows the result.
export function MembershipConfirm({
  heading,
  children,
}: {
  heading: ReactNode;
  children?: ReactNode;
}) {
  const [state, setState] = useState<"checking" | "done" | "problem">(
    "checking",
  );
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const thanks = useRef<HTMLDialogElement>(null);

  // Pop up a thank-you note as soon as the payment is confirmed.
  useEffect(() => {
    if (state === "done") thanks.current?.showModal();
  }, [state]);

  useEffect(() => {
    const pi = new URLSearchParams(window.location.search).get(
      "payment_intent",
    );
    if (!pi) {
      setState("problem");
      return;
    }
    fetch("/api/membership/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntent: pi }),
    })
      .then((r) => r.json())
      .then((d) => {
        setName(d.name ?? "");
        setState(d.status === "succeeded" ? "done" : "problem");
      })
      .catch(() => setState("problem"));
  }, []);

  const left = (body: ReactNode) => (
    <div>
      {heading}
      <div className="mt-6 text-lg leading-relaxed">{body}</div>
      {children}
    </div>
  );

  const badge = `/membership/badge?name=${encodeURIComponent(name)}`;
  const card =
    "relative aspect-square w-full max-w-md rounded-2xl md:justify-self-end";

  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      <dialog
        ref={thanks}
        data-lenis-prevent
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(92vw,26rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white p-8 text-center shadow-2xl backdrop:bg-black/50"
      >
        <h2 className="text-2xl font-bold tracking-tight">
          Thank you{name ? `, ${name.split(" ")[0]}` : ""}!
        </h2>
        <p className="mt-3 text-muted">
          Welcome to Warrnambool Islamic Society. You are now a member. May
          Allah accept it from you and reward you.
        </p>
        <form method="dialog" className="mt-6">
          <button className="rounded-lg bg-[#16c05a] px-8 py-2.5 font-semibold text-white hover:brightness-95">
            Close
          </button>
        </form>
      </dialog>
      {left(
        state === "checking" ? (
          <p className="text-muted">Confirming your payment...</p>
        ) : state === "problem" ? (
          <p>
            We could not confirm your payment yet. If you were charged, please
            contact us and we will check it for you.
          </p>
        ) : (
          <p>
            Thank you! Your payment was received and you are now a member of
            Warrnambool Islamic Society. May Allah accept it from you and reward
            you.
          </p>
        ),
      )}
      {state === "checking" && (
        <div className={`${card} animate-pulse bg-border`} aria-hidden />
      )}
      {state === "done" && (
        // The grey block shows until the image has loaded.
        <div className={`${card} ${loaded ? "" : "animate-pulse bg-border"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={badge}
            onLoad={() => setLoaded(true)}
            alt={`${name || "New member"} is officially a member of Warrnambool Islamic Society`}
            width={600}
            height={600}
            className={`size-full rounded-2xl transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          />
          {loaded && (
            <a
              href={badge}
              download="wis-member.png"
              aria-label="Download image"
              className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-dark shadow-lg hover:bg-background"
            >
              <Download className="size-4" aria-hidden />
              Download
            </a>
          )}
        </div>
      )}
    </div>
  );
}
