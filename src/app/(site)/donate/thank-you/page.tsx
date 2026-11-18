import type { Metadata } from "next";
import { DonationThanks } from "@/components/donation-thanks";

export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

// Stripe sends donors here after they give.
export default function ThankYou() {
  return (
    <div className="px-4">
      <DonationThanks />
    </div>
  );
}
