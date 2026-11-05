import { PageShell } from "@/components/page-shell";

export const metadata = { title: "Donate" };

export default function Donate() {
  return (
    <PageShell
      title="Donate"
      intro="Those who spend their wealth [in Allah's way] by night and by day, secretly and publicly: they will have their reward with their Lord. (Surah Al-Baqarah 2:274)"
    >
      <p>
        Warrnambool Islamic Society is a registered charity with the ACNC. Your support
        will help establish a permanent place of worship, strengthen the local Muslim
        community, and create a space for future generations.
      </p>
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted">
        Online card donations will run through Stripe once the API keys are added to
        <code> .env.local</code>. Until then, please contact the committee for bank details.
      </p>
    </PageShell>
  );
}
