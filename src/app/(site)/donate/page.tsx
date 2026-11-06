import { PageShell } from "@/components/page-shell";
import { getDonation } from "@/lib/content";

export const metadata = { title: "Donate" };

export default async function Donate() {
  const d = await getDonation();
  const purposes = d.purposes.filter((p) => p.on);
  const hasBank = Boolean(d.account_name && d.bsb && d.account_no);
  return (
    <PageShell
      title="Donate"
      intro="Those who spend their wealth [in Allah's way] by night and by day, secretly and publicly: they will have their reward with their Lord. (Surah Al-Baqarah 2:274)"
    >
      <p>
        Warrnambool Islamic Society is a registered charity with the ACNC.{" "}
        {d.intro ||
          "Your support will help establish a permanent place of worship, strengthen the local Muslim community, and create a space for future generations."}
      </p>
      {hasBank ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-bold">Bank transfer</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
            <dt className="text-muted">Account name</dt>
            <dd className="font-medium">{d.account_name}</dd>
            <dt className="text-muted">BSB</dt>
            <dd className="font-medium tabular-nums">{d.bsb}</dd>
            <dt className="text-muted">Account number</dt>
            <dd className="font-medium tabular-nums">{d.account_no}</dd>
          </dl>
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted">
          Please contact the committee for bank details. Online card donations are coming soon.
        </p>
      )}
      {purposes.length > 0 && (
        <div>
          <p className="font-medium">You can give to</p>
          <p className="mt-2 flex flex-wrap gap-2">
            {purposes.map((p) => (
              <span key={p.id} className="rounded-full bg-card px-3 py-1 text-sm">
                {p.name}
              </span>
            ))}
          </p>
        </div>
      )}
    </PageShell>
  );
}
