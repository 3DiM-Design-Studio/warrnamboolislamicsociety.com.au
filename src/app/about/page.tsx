import { PageShell } from "@/components/page-shell";
import { mission, officeBearers } from "@/content/site";

export const metadata = { title: "About Us" };

export default function About() {
  return (
    <PageShell
      title="About Us"
      intro="We have created Warrnambool Islamic Society with a mission to serve Warrnambool and neighbouring communities by service, education and empowerment, based on Islamic principles of compassion, unity and justice. We are a not-for-profit organisation."
    >
      {mission.map((m) => (
        <div key={m.title}>
          <h2 className="font-bold text-brand-dark">{m.title}</h2>
          <p className="text-muted">{m.body}</p>
        </div>
      ))}
      <h2 className="pt-6 text-2xl font-bold text-brand-dark">Office bearers</h2>
      <dl className="divide-y divide-border rounded-lg border border-border bg-card">
        {officeBearers.map((o) => (
          <div key={o.role} className="flex flex-wrap justify-between gap-2 p-4">
            <dt className="font-medium">{o.role}</dt>
            <dd className="text-muted">{o.names.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </PageShell>
  );
}
