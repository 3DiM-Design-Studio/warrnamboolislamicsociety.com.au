import type { Metadata } from "next";
import { MembershipThanks } from "@/components/membership-thanks";

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: false } };

// Stripe sends new members here after they pay.
export default function MembershipThankYou() {
  return (
    <div className="px-4">
      <MembershipThanks />
    </div>
  );
}
