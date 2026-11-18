"use client";

import { useSyncExternalStore } from "react";
import { ThankYouView } from "@/components/thank-you-view";

const noSubscribe = () => () => {};
// Stripe sends the person back here with ?redirect_status=succeeded (or failed, processing). A direct visit has none.
const readStatus = () => new URLSearchParams(window.location.search).get("redirect_status") ?? "none";

export function DonationThanks() {
  const status = useSyncExternalStore(noSubscribe, readStatus, () => "none");
  const back = { href: "/donate", label: "Back to Donate" };

  if (status === "failed" || status === "requires_payment_method") {
    return (
      <ThankYouView
        title="Your payment did not go through"
        message="No money was taken. Please go back and try again, or use a different card. If it keeps happening, contact us and we will help."
        back={back}
      />
    );
  }
  if (status === "processing" || status === "requires_action") {
    return (
      <ThankYouView
        title="Your payment is being processed"
        message="Your bank is still finishing the payment. You do not need to do anything. If you asked for a receipt, we will email it once it is complete."
        back={back}
      />
    );
  }
  if (status === "succeeded") {
    return (
      <ThankYouView
        title="Jazakallahu khayran"
        message="Your donation was received. May Allah accept it from you and reward you. If you asked for a receipt, it is on its way to your email."
        back={back}
      />
    );
  }
  return (
    <ThankYouView
      title="Thank you for your support"
      message="Every gift helps build a permanent place of worship and strengthens our community. May Allah reward you."
      back={back}
    />
  );
}
