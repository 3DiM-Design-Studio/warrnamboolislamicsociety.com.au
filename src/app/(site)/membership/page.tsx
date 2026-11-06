import { MembershipForm } from "@/components/membership-form";
import { PageShell } from "@/components/page-shell";

export const metadata = { title: "Membership" };

export default function Membership() {
  return (
    <PageShell
      title="Membership"
      intro="Join Warrnambool Islamic Society and help shape our community."
    >
      <p>
        Fill in the form and a committee member will be in touch. There&apos;s a place for
        everyone here.
      </p>
      <MembershipForm />
    </PageShell>
  );
}
