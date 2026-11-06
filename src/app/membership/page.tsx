import { Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { MembershipForm } from "@/components/membership-form";
import { PageShell } from "@/components/page-shell";

export const metadata = { title: "Membership" };

export default function Membership() {
  return (
    <PageShell
      title="Be part of something bigger and help shape our community."
      crumb="Membership"
      highlight="shape our community"
      icons={{
        bigger: <Sparkles className="size-[0.75em]" aria-hidden />,
        community: <Users className="size-[0.75em]" aria-hidden />,
      }}
      intro="Join our community and connect with people who share your passions and your drive for personal and collective growth. There's a place for everyone here, and we can't wait to welcome you into our growing family."
    >
      <div>
        <section>
          <MembershipForm />
          <p className="mt-6 px-1 text-xs text-muted">
            Questions? Visit our{" "}
            <Link
              href="/contact"
              className="link-fx font-semibold text-brand-dark"
            >
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </PageShell>
  );
}
