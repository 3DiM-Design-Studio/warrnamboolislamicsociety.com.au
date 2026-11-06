import { PageShell } from "@/components/page-shell";
import { prayerNotes } from "@/content/site";
import { getJumuah, getPrayerBoard } from "@/lib/content";

export const metadata = { title: "Prayer Times" };

export default async function PrayerTimes() {
  const [board, jumuah] = await Promise.all([getPrayerBoard(), getJumuah()]);
  return (
    <PageShell title="Prayer Times" intro="Please find our prayer times for Warrnambool below.">
      {board.show && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <p className="border-b border-border px-4 py-3 text-sm text-muted">{board.dateLabel}</p>
          <table className="w-full text-left">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Prayer</th>
                <th className="px-4 py-2 font-medium">Azan</th>
                <th className="px-4 py-2 font-medium">Iqamah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {board.rows.map((r) => (
                <tr key={r.key} className={r.key === "sunrise" ? "text-muted" : ""}>
                  <td className="px-4 py-3 font-medium">
                    {r.name}
                    {r.ramadan && (
                      <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">Ramadan</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.azan}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{r.iqamah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="rounded-lg border border-border bg-card p-4">
        Jumu&apos;ah:{" "}
        <strong>{jumuah.today ? `Every Friday at ${jumuah.today}` : "Every Friday. Please contact the committee for this season's time."}</strong>
      </p>
      {jumuah.seasons.length > 1 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {jumuah.seasons.map((s) => (
            <li key={s.name}>
              {s.name} ({s.range}): {s.time}
            </li>
          ))}
        </ul>
      )}

      <ul className="list-disc space-y-2 pl-5">
        {prayerNotes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <blockquote className="border-l-4 border-accent pl-4 italic text-muted">
        It is He who shows you lightning, [causing] fear and aspiration, and generates the
        heavy clouds. (Ar-Ra&apos;d: 12)
      </blockquote>
    </PageShell>
  );
}
