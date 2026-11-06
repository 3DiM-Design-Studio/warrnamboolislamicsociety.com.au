import { HandHeart, Users } from "lucide-react";
import Link from "next/link";
import { MembershipConfirm } from "@/components/membership-confirm";
import { ThanksGreeting } from "@/components/thanks-greeting";
import { PageHeading, PageShell } from "@/components/page-shell";

export const metadata = { title: "Welcome" };

export default function MembershipThankYou() {
  return (
    <PageShell
      title="Welcome to the community"
      crumb="Welcome"
      parent={{ label: "Membership", href: "/membership" }}
      hideHeading
    >
      <MembershipConfirm
        heading={
          <>
            <PageHeading
              title="Welcome to the community"
              highlight="the community"
              icons={{
                welcome: <HandHeart className="size-[0.75em]" aria-hidden />,
                community: <Users className="size-[0.75em]" aria-hidden />,
              }}
            />
            <ThanksGreeting />
          </>
        }
      >
        <Link href="/" className="link-fx mt-4 inline-block font-semibold">
          Back to home
        </Link>
      </MembershipConfirm>
    </PageShell>
  );
}
