import type { Metadata } from "next";
import { MembershipThanks } from "@/components/membership-thanks";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: false } };

// Stripe sends new members here after they pay.
export default async function MembershipThankYou() {
  const { whatsapp } = await getSettings();
  return (
    <div className="flex min-h-[calc(100dvh-13rem)] items-center px-4 py-8 sm:min-h-[calc(100dvh-9.5rem)] sm:py-12">
      <MembershipThanks whatsapp={whatsapp} />
    </div>
  );
}
