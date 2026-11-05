import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata = { title: "Membership" };

export default function Membership() {
  return (
    <PageShell
      title="Membership"
      intro="Join Warrnambool Islamic Society and help shape our community."
    >
      <p>
        The existing site collects member registrations through a form. Online
        registration (via Paid Memberships Pro) is not migrated yet. To register
        now, please{" "}
        <Link href="/contact" className="text-brand link-fx">
          contact the committee
        </Link>
        .
      </p>
    </PageShell>
  );
}
