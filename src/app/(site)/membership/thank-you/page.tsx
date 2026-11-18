import type { Metadata } from "next";
import { MembershipThanks } from "@/components/membership-thanks";

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: false } };

// Stripe sends new members here after they pay.
export default function MembershipThankYou() {
  return (
    <div className="flex min-h-[calc(100dvh-13rem)] items-center px-4 py-8 sm:min-h-[calc(100dvh-9.5rem)] sm:py-12">
      <MembershipThanks />
    </div>
  );
}
