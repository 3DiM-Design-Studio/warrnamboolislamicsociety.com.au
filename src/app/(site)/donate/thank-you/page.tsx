import type { Metadata } from "next";
import { DonationThanks } from "@/components/donation-thanks";

export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

// Stripe sends donors here after they give.
export default function ThankYou() {
  return (
    <div className="flex min-h-[calc(100dvh-13rem)] items-center px-4 py-8 sm:min-h-[calc(100dvh-9.5rem)] sm:py-12">
      <DonationThanks />
    </div>
  );
}
