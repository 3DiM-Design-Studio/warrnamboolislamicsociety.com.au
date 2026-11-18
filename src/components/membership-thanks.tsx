"use client";

import { Download } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ThankYouView } from "@/components/thank-you-view";

// Confirms the membership payment with the server (which emails the committee once), then shows the thank-you page
// with the member's picture to download.
const noSubscribe = () => () => {};

export function MembershipThanks() {
  // The payment code Stripe adds to the address. "" means it is missing; undefined means the page is still loading.
  const pi = useSyncExternalStore(noSubscribe, () => new URLSearchParams(window.location.search).get("payment_intent") ?? "", () => undefined);
  const [result, setResult] = useState<"checking" | "done" | "problem">("checking");
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!pi) return;
    fetch("/api/membership/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntent: pi }),
    })
      .then((r) => r.json())
      .then((d) => {
        setName(d.name ?? "");
        setResult(d.status === "succeeded" ? "done" : "problem");
      })
      .catch(() => setResult("problem"));
  }, [pi]);

  const state = pi === "" ? "problem" : result;

  const back = { href: "/membership", label: "Back to Membership" };

  if (state === "checking") {
    return <ThankYouView title="Confirming your payment" message="One moment please. This only takes a few seconds." back={back} />;
  }
  if (state === "problem") {
    return (
      <ThankYouView
        title="We could not confirm your payment yet"
        message="If you were charged, please contact us and we will check it for you. If you were not charged, you can go back and try again."
        back={back}
      />
    );
  }

  const badge = `/membership/badge?name=${encodeURIComponent(name)}`;
  const first = name.split(" ")[0];
  return (
    <ThankYouView
      title={`Welcome${first ? `, ${first}` : ""}!`}
      message="Thank you. Your payment was received and you are now a member of Warrnambool Islamic Society. May Allah accept it from you and reward you."
      back={back}
    >
      <div className={`relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl ${loaded ? "" : "skeleton"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={badge}
          onLoad={() => setLoaded(true)}
          alt={`${name || "New member"} is officially a member of Warrnambool Islamic Society`}
          width={600}
          height={600}
          className={`size-full transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
      {loaded && (
        <a href={badge} download="wis-member.png" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-background">
          <Download className="size-4" aria-hidden />
          Download my picture
        </a>
      )}
    </ThankYouView>
  );
}
