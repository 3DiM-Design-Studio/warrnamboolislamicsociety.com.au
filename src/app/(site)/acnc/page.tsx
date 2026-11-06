import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata = { title: "ACNC Registration" };

export default function Acnc() {
  return (
    <PageShell title="ACNC Registration">
      <p>
        Warrnambool Islamic Society (WIS) is now officially registered as a charity with
        the ACNC, Alhamdulillah. This marks a major step forward for our community.
      </p>
      <p>
        We are awaiting the final decision on our planning permit. The goal is clear: build
        a dedicated place of worship for our growing community. Your support will help
        establish a permanent place of worship, strengthen the local Muslim community and
        create a space for future generations.
      </p>
      <p>
        Read the full{" "}
        <Link href="/news/wis-registered-charity-acnc" className="text-brand underline">
          announcement
        </Link>
        .
      </p>
    </PageShell>
  );
}
