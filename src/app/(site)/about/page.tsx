import { PageShell } from "@/components/page-shell";
import { mission } from "@/content/site";
import { getTeamGroups } from "@/lib/content";

export const metadata = { title: "About Us" };

export default async function About() {
  const groups = await getTeamGroups();
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
        {groups.map((g) => (
          <div key={g.role} className="flex flex-wrap justify-between gap-2 p-4">
            <dt className="font-medium">{g.role}</dt>
            <dd className="text-muted">{g.people.map((p) => p.name).join(", ")}</dd>
          </div>
        ))}
      </dl>
    </PageShell>
  );
}
