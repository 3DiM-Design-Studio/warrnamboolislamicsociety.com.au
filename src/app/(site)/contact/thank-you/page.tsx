import type { Metadata } from "next";
import { ThankYouView } from "@/components/thank-you-view";

export const metadata: Metadata = { title: "Message sent", robots: { index: false, follow: false } };

// Shown right after someone sends a message with the Contact form.
export default function ContactThankYou() {
  return (
    <div className="px-4">
      <ThankYouView
        title="Thank you, we have your message"
        message="A member of the committee will reply by email as soon as possible, InshaAllah."
        back={{ href: "/contact", label: "Back to Contact" }}
      />
    </div>
  );
}
