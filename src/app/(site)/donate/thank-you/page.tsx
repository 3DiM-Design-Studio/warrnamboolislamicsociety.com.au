import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata = { title: "Thank you" };

export default function ThankYou() {
  return (
    <PageShell title="Jazakallahu khayran" intro="Thank you for your donation.">
      <p>
        Your payment was received. May Allah accept it from you and reward you.
      </p>
      <Link href="/" className="link-fx inline-block font-semibold">
        Back to home
      </Link>
    </PageShell>
  );
}
